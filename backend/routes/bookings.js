const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, admin } = require("../middleware/authmiddleware");
const Booking = require("../models/Booking");
const Train = require("../models/Train");
const { WaitingList, WaitingCounter } = require("../models/Waiting");


const PRICE_PER_KM = 2;

// Calculate distance & fare
function calculateFareAndDistance(train, startStation, endStation, pricePerKm = PRICE_PER_KM) {
    const route = train.stops || [];
    const start = route.find(s => s.station === startStation);
    const end = route.find(s => s.station === endStation);

    if (!start || !end) return { distance: 0, fare: 0 };

    const distance = Math.abs(end.km - start.km);
    const fare = distance * pricePerKm;

    return { distance, fare };
}

// Create booking
router.post("/", protect, async (req, res) => {
    try {
        const { trainId, startStation, endStation, passenger, seats, journeyDate } = req.body;

        if (!trainId || !startStation || !endStation || !passenger || !seats || !journeyDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const train = await Train.findById(trainId);
        if (!train) return res.status(404).json({ message: "Train not found" });

        const { distance, fare } = calculateFareAndDistance(train, startStation, endStation);

        // Check seats already booked
        const confirmedBookings = await Booking.find({ train: trainId, journeyDate, status: "Confirmed" });
        const bookedSeats = confirmedBookings.reduce((acc, b) => acc + b.seats, 0);
        const totalSeats = train.totalSeats;

        if (bookedSeats + seats <= totalSeats) {
            // Confirmed booking
            const booking = await Booking.create({
                user: req.user._id,
                train: train._id,
                seats,
                passenger,
                startStation,
                endStation,
                journeyDate,
                distance,
                fare,
                price: fare * seats,
                status: "Confirmed",
            });

            return res.status(201).json({ message: "Booking confirmed!", booking });
        } else {
            // Train full → add to waiting list atomically
            const counter = await WaitingCounter.findOneAndUpdate(
                { train: train._id, journeyDate },
                { $inc: { lastPosition: 1 } },
                { new: true, upsert: true }
            );

            const position = counter.lastPosition;

            const waitingBooking = await WaitingList.create({
                user: req.user._id,
                train: train._id,
                seats,
                passenger,
                startStation,
                endStation,
                journeyDate,
                fare,
                price: fare * seats,
                position,
            });

            return res.status(200).json({
                message: `Train full. Added to waiting list at position ${position}.`,
                waitingBooking,
            });
        }
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Server Error", stack: error.stack });
    }
});

// Get user bookings
router.get("/", protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("train", "name trainNumber route totalSeats")
            .sort({ createdAt: -1 });

        const waitingBookings = await WaitingList.find({ user: req.user._id })
            .populate("train", "name trainNumber route totalSeats")
            .sort({ createdAt: -1 });

        const waitingMapped = waitingBookings.map(w => ({
            _id: w._id,
            train: w.train,
            seats: w.seats,
            passenger: w.passenger,
            startStation: w.startStation,
            endStation: w.endStation,
            journeyDate: w.journeyDate,
            price: w.price,
            fare: w.fare,
            status: `Waiting (#${w.position})`,
        }));

        const allBookings = [...bookings, ...waitingMapped].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(allBookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server Error", stack: error.stack });
    }
});

// Get all bookings (Admin)
router.get("/admin/bookings", protect, admin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("train", "name trainNumber route totalSeats")
            .populate("user", "name email") 
            .sort({ createdAt: -1 });

        const waitingBookings = await WaitingList.find()
            .populate("train", "name trainNumber route totalSeats")
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        const waitingMapped = waitingBookings.map(w => ({
            _id: w._id,
            train: w.train,
            user: w.user,
            seats: w.seats,
            passenger: w.passenger,
            startStation: w.startStation,
            endStation: w.endStation,
            journeyDate: w.journeyDate,
            price: w.price,
            fare: w.fare,
            status: `Waiting (#${w.position})`,
            createdAt: w.createdAt,
        }));

        const allBookings = [...bookings, ...waitingMapped].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(allBookings);
    } catch (error) {
        console.error("Error fetching admin bookings:", error);
        res.status(500).json({ message: "Server Error", stack: error.stack });
    }
});

// Cancel booking
router.put("/:id/cancel", protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        // Check confirmed bookings
        let booking = await Booking.findOne({ _id: id, user: req.user._id });

        if (booking) {
            booking.status = "Cancelled";
            await booking.save();

            // Promote first waiting user if exists
            let waitingList = await WaitingList.find({ train: booking.train, journeyDate: booking.journeyDate })
                .sort({ position: 1 });

            if (waitingList.length > 0) {
                const firstWaiting = waitingList[0];

                await Booking.create({
                    user: firstWaiting.user,
                    train: firstWaiting.train,
                    seats: firstWaiting.seats,
                    passenger: firstWaiting.passenger,
                    startStation: firstWaiting.startStation,
                    endStation: firstWaiting.endStation,
                    journeyDate: firstWaiting.journeyDate,
                    distance: booking.distance,
                    fare: firstWaiting.fare,
                    price: firstWaiting.price,
                    status: "Confirmed",
                });

                await WaitingList.deleteOne({ _id: firstWaiting._id });

                // Reorder remaining positions
                waitingList = waitingList.slice(1);
                for (let i = 0; i < waitingList.length; i++) {
                    const newPos = i + 1;
                    if (waitingList[i].position !== newPos) {
                        await WaitingList.findByIdAndUpdate(waitingList[i]._id, { position: newPos });
                    }
                }

                await WaitingCounter.findOneAndUpdate(
                    { train: booking.train, journeyDate: booking.journeyDate },
                    { lastPosition: waitingList.length }
                );
            }

            return res.json({ message: "Booking cancelled and waiting list updated.", booking });
        }

        // Check waiting list bookings
        booking = await WaitingList.findOne({ _id: id, user: req.user._id });

        if (booking) {
            const deletedPosition = booking.position;
            await WaitingList.deleteOne({ _id: id });

            const remaining = await WaitingList.find({ train: booking.train, journeyDate: booking.journeyDate })
                .sort({ position: 1 });

            for (let i = 0; i < remaining.length; i++) {
                const newPos = i + 1;
                if (remaining[i].position !== newPos) {
                    await WaitingList.findByIdAndUpdate(remaining[i]._id, { position: newPos });
                }
            }

            await WaitingCounter.findOneAndUpdate(
                { train: booking.train, journeyDate: booking.journeyDate },
                { lastPosition: remaining.length }
            );

            return res.json({ message: `Waiting ticket at position #${deletedPosition} cancelled successfully.` });
        }

        return res.status(404).json({ message: "Booking not found" });

    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

// Get waiting list for a train/date
router.get("/waiting-list/:trainId/:journeyDate", protect, async (req, res) => {
    try {
        const { trainId, journeyDate } = req.params;
        const waitingList = await WaitingList.find({ train: trainId, journeyDate }).sort({ position: 1 });
        res.json({ waitingList });
    } catch (error) {
        console.error("Error fetching waiting list:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
