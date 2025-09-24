const User = require("../models/User");
const Booking = require("../models/Booking");
const Train = require("../models/Train");
const { WaitingList } = require("../models/Waiting"); 

// ✅ Get all users (exclude password)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// ✅ Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

// ✅ Get all bookings (with user + train populated) and include waiting list
const getBookings = async (req, res) => {
    try {
        // Fetch confirmed bookings
        const bookings = await Booking.find()
            .populate("user", "name email") // only show these fields
            .populate("train", "name source destination price seats");

        // Fetch waiting list bookings
        const waiting = await WaitingList.find()
            .populate("user", "name email")
            .populate("train", "name source destination price seats")
            .sort({ journeyDate: 1, position: 1 });

        // Map waiting list to booking-like structure
        const waitingMapped = waiting.map(w => ({
            _id: w._id,
            user: w.user,
            train: w.train,
            seats: w.seats,
            passenger: w.passenger,
            startStation: w.startStation,
            endStation: w.endStation,
            journeyDate: w.journeyDate,
            price: w.price,
            fare: w.fare,
            status: `Waiting (#${w.position})`,
            distance: w.fare / 2 // optional approximation
        }));

        // Combine confirmed bookings and waiting list
        const allBookings = [...bookings, ...waitingMapped].sort(
            (a, b) => new Date(b.createdAt || b.journeyDate) - new Date(a.createdAt || a.journeyDate)
        );

        res.json(allBookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// ✅ Get all trains
const getTrains = async (req, res) => {
    try {
        const trains = await Train.find();
        res.json(trains);
    } catch (err) {
        console.error("Error fetching trains:", err);
        res.status(500).json({ message: "Failed to fetch trains" });
    }
};

module.exports = { getAllUsers, deleteUser, getBookings, getTrains };
