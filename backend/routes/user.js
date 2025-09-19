const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authmiddleware');

// Get all users (Admin)
router.get('/', protect, admin, async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
});

// Delete user (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) res.json({ message: 'User deleted' });
    else res.status(404).json({ message: 'User not found' });
});

module.exports = router;
