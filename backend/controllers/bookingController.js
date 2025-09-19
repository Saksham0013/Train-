const Booking = require("../models/Booking");
const Train = require("../models/Train");
const { buildRouteSegments, normalize } = require("../utils/segmentUtils"); 

// Get all bookings (Admin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user")
            .populate("train");
        res.json(bookings);
    } catch (err) {
        console.error("❌ Error fetching bookings:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const { trainId, startStation, endStation, seats, passenger } = req.body;

        // Fetch train
        const train = await Train.findById(trainId);
        if (!train) return res.status(404).json({ message: "Train not found" });

        // --- Build segmentsBooked with validation ---
        let routeSegments;
        try {
            routeSegments = buildRouteSegments(train.segments, startStation, endStation, seats);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        // --- Decrement seats in each segment ---
        for (let seg of train.segments) {
            for (let bookedSeg of routeSegments) {
                if (
                    normalize(seg.from) === normalize(bookedSeg.from) &&
                    normalize(seg.to) === normalize(bookedSeg.to)
                ) {
                    seg.seatsAvailable -= seats;
                }
            }
        }

        // --- Decrement total train seats ---
        if (train.seats < seats) {
            return res.status(400).json({ message: "Not enough seats on train" });
        }
        train.seats -= seats;

        await train.save();

        // --- Create booking ---
        const booking = new Booking({
            user: req.user._id,
            train: trainId,
            seats,
            passenger,
            startStation,
            endStation,
            price: train.price * seats,
            segmentsBooked: routeSegments,
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        console.error("❌ Error creating booking:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("train");
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === "Cancelled") {
            return res.status(400).json({ message: "Booking already cancelled" });
        }

        const train = await Train.findById(booking.train._id);

        // Restore seats for each booked segment
        for (let bookedSeg of booking.segmentsBooked) {
            for (let seg of train.segments) {
                if (
                    normalize(seg.from) === normalize(bookedSeg.from) &&
                    normalize(seg.to) === normalize(bookedSeg.to)
                ) {
                    seg.seatsAvailable += bookedSeg.seats;
                }
            }
        }

        // Restore total seats
        train.seats += booking.seats;
        await train.save();

        // Update booking status
        booking.status = "Cancelled";
        await booking.save();

        res.json(booking);
    } catch (err) {
        console.error("❌ Error cancelling booking:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getAllBookings, createBooking, cancelBooking };
