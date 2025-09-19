const Train = require("../models/Train");

// Get all trains
const getTrains = async (req, res) => {
    const trains = await Train.find();
    res.json(trains);
};

// Get train by ID
const getTrainById = async (req, res) => {
    const train = await Train.findById(req.params.id);
    if (train) res.json(train);
    else res.status(404).json({ message: "Train not found" });
};

// Create train
const createTrain = async (req, res) => {
    const train = await Train.create(req.body);
    res.status(201).json(train);
};

// Update train
const updateTrain = async (req, res) => {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (train) res.json(train);
    else res.status(404).json({ message: "Train not found" });
};

// Delete train
const deleteTrain = async (req, res) => {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (train) res.json({ message: "Train deleted" });
    else res.status(404).json({ message: "Train not found" });
};

module.exports = { getTrains, getTrainById, createTrain, updateTrain, deleteTrain };
