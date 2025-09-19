const User = require("../models/User");
const Booking = require("../models/Booking");
const Train = require("../models/Train");

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

// ✅ Get all bookings (with user + train populated)
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "name email") // only show these fields
            .populate("train", "name source destination price seats");

        res.json(bookings);
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
