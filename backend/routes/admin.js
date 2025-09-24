const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authmiddleware");
const { getAllUsers, deleteUser, getBookings, getTrains } = require("../controllers/adminController");

// Users
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);

// Bookings (confirmed + waiting list)
router.get("/bookings", protect, admin, getBookings);

// Trains (admin view)
router.get("/trains", protect, admin, getTrains);

module.exports = router;
