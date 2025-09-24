const mongoose = require("mongoose");

const waitingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    train: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
    seats: Number,
    passenger: Object,
    startStation: String,
    endStation: String,
    journeyDate: Date,
    fare: Number,
    price: Number,
    position: Number,
}, { timestamps: true });

const WaitingList = mongoose.model("WaitingList", waitingSchema);

const waitingCounterSchema = mongoose.Schema({
    train: { type: mongoose.Schema.Types.ObjectId, ref: "Train" },
    journeyDate: Date,
    lastPosition: Number,
});

const WaitingCounter = mongoose.model("WaitingCounter", waitingCounterSchema);

module.exports = { WaitingList, WaitingCounter };
