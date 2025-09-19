const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middleware/authmiddleware");
const Booking = require("../models/Booking");
const Train = require("../models/Train");

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
        const { trainId, startStation, endStation, passenger, seats, date } = req.body;

        if (!trainId || !startStation || !endStation || !passenger || !seats || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const train = await Train.findById(trainId);
        if (!train) return res.status(404).json({ message: "Train not found" });

        const { distance, fare } = calculateFareAndDistance(train, startStation, endStation);

        const booking = await Booking.create({
            user: req.user._id,
            train: train._id,
            seats,
            passenger,
            startStation,
            endStation,
            date,
            distance,
            fare,
            price: fare * seats,
            status: "Confirmed",
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Server Error", stack: error.stack });
    }
});

// Get user bookings
router.get("/", protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("train", "name trainNumber route")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
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

        const updatedBooking = await Booking.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { status: "Cancelled" },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (updatedBooking.status !== "Cancelled") {
            return res.status(500).json({ message: "Failed to cancel booking" });
        }

        res.json({ message: "Booking cancelled successfully", booking: updatedBooking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

module.exports = router;
