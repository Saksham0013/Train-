const mongoose = require("mongoose");

// Passenger schema (embedded)
const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    email: { type: String, required: true, trim: true },
    aadhar: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
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
        journeyDate: {
            type: String, 
            required: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^\d{4}-\d{2}-\d{2}$/.test(v);
                },
                message: props => `${props.value} is not a valid date (YYYY-MM-DD)!`,
            },
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

        // Optional Segment tracking (for seat allocation between stations)
        segmentsBooked: [
            {
                from: { type: String, required: true },
                to: { type: String, required: true },
                seats: { type: Number, required: true, min: 1 },
            },
        ],

        // Status
        status: {
            type: String,
            enum: ["Confirmed", "Waiting", "Cancelled"],
            default: "Confirmed",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
