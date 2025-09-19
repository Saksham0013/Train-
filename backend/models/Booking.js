const mongoose = require("mongoose");

// Passenger schema (embedded)
const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    aadhar: { type: String, required: true },
    address: { type: String, required: true },
});

// Booking schema
const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        train: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Train",
            required: true,
        },
        seats: {
            type: Number,
            required: true,
            min: 1,
        },

        // Passenger Details
        passenger: {
            type: passengerSchema,
            required: true,
        },

        // Journey Details
        startStation: {
            type: String,
            required: true,
            trim: true,
        },
        endStation: {
            type: String,
            required: true,
            trim: true,
        },

           // Journey Date
        date: {
            type: Date,
            required: true,
        },

        // Distance and Fare
        distance: {
            type: Number,
            required: true,
            min: 0,
        },
        fare: {
            type: Number,
            required: true,
            min: 0,
        },

        // Total Price for this journey
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // Segment tracking (for seat allocation)
        segmentsBooked: [
            {
                from: { type: String, required: true },
                to: { type: String, required: true },
                seats: { type: Number, required: true },
            },
        ],

        // Status
        status: {
            type: String,
            enum: ["Confirmed", "Cancelled"],
            default: "Confirmed", 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
