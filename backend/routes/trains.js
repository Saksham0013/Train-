const express = require("express");
const router = express.Router();
const Train = require("../models/Train");
const verifyToken = require("../middleware/verifyToken");

// Helper: validate and normalize stop
function normalizeStop(stop, defaultOrder = 0) {
    return {
        station: stop.station || "Unknown",
        arrival: stop.arrival || "--",
        departure: stop.departure || "--",
        km: Number(stop.km) || 0,
        order: Number(stop.order) || defaultOrder
    };
}

// ADD NEW TRAIN
router.post("/", verifyToken, async (req, res) => {
    try {
        let { trainNumber, name, source, destination, departureTime, arrivalTime, seats, stops } = req.body;

        if (!trainNumber || !name || !source || !destination || !departureTime || !arrivalTime) {
            return res.status(400).json({ error: "Please fill all required fields." });
        }

        const existingTrain = await Train.findOne({ trainNumber });
        if (existingTrain) return res.status(400).json({ error: "Train Number already exists!" });

        seats = Number(seats) || 0;
        stops = Array.isArray(stops) ? stops.map(normalizeStop) : [];

        // Ensure first stop is source
        if (!stops[0] || stops[0].station !== source) {
            stops.unshift({ station: source, arrival: "--", departure: departureTime, km: 0, order: 0 });
        }

        // Ensure last stop is destination
        if (!stops[stops.length - 1] || stops[stops.length - 1].station !== destination) {
            const lastKm = stops.length > 0 ? stops[stops.length - 1].km + 1 : 1;
            stops.push({ station: destination, arrival: arrivalTime, departure: "--", km: lastKm, order: stops.length });
        }

        const newTrain = new Train({
            trainNumber: String(trainNumber),
            name,
            source,
            destination,
            departureTime,
            arrivalTime,
            seats,
            stops
        });

        const savedTrain = await newTrain.save();
        res.status(201).json({ message: "Train added successfully!", train: savedTrain });
    } catch (err) {
        console.error("Add train error:", err);
        res.status(500).json({ error: err.message || "Server error." });
    }
});

// GET ALL TRAINS
router.get("/", async (req, res) => {
    try {
        const trains = await Train.find().sort({ createdAt: -1 });
        res.status(200).json(trains);
    } catch (err) {
        console.error("Get trains error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

// SEARCH TRAINS
router.get("/search", async (req, res) => {
    const { q, source, destination } = req.query;

    try {
        let query = {};
        if (q) {
            const searchTerm = String(q);
            query = {
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { trainNumber: { $regex: searchTerm, $options: "i" } }
                ]
            };
        } else {
            if (source) query.source = { $regex: String(source), $options: "i" };
            if (destination) query.destination = { $regex: String(destination), $options: "i" };
        }

        if (Object.keys(query).length === 0) {
            return res.status(400).json({ error: "Please provide search parameters" });
        }

        const trains = await Train.find(query);
        res.status(200).json(trains);
    } catch (err) {
        console.error("Search train error:", err);
        res.status(500).json({ error: err.message || "Server Error" });
    }
});

// GET TRAIN BY ID
router.get("/:id", async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        if (!train) return res.status(404).json({ error: "Train not found" });
        res.json(train);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE TRAIN
router.put("/:id", verifyToken, async (req, res) => {
    try {
        let { trainNumber, seats, stops, source, destination, departureTime, arrivalTime, ...otherFields } = req.body;

        const updateData = { ...otherFields };

        if (trainNumber) {
            const duplicate = await Train.findOne({ trainNumber: String(trainNumber), _id: { $ne: req.params.id } });
            if (duplicate) return res.status(400).json({ error: "Train Number already exists!" });
            updateData.trainNumber = String(trainNumber);
        }
        if (seats !== undefined) updateData.seats = Number(seats);
        if (source) updateData.source = source;
        if (destination) updateData.destination = destination;
        if (departureTime) updateData.departureTime = departureTime;
        if (arrivalTime) updateData.arrivalTime = arrivalTime;

        if (stops && Array.isArray(stops)) {
            stops = stops.map(normalizeStop);
            // Ensure first stop is source
            if (!stops[0] || stops[0].station !== (source || updateData.source)) {
                stops.unshift({ station: source || updateData.source, arrival: "--", departure: departureTime || updateData.departureTime, km: 0, order: 0 });
            }
            // Ensure last stop is destination
            if (!stops[stops.length - 1] || stops[stops.length - 1].station !== (destination || updateData.destination)) {
                const lastKm = stops.length > 0 ? stops[stops.length - 1].km + 1 : 1;
                stops.push({ station: destination || updateData.destination, arrival: arrivalTime || updateData.arrivalTime, departure: "--", km: lastKm, order: stops.length });
            }
            updateData.stops = stops;

            // Regenerate segments
            const segments = [];
            for (let i = 0; i < stops.length - 1; i++) {
                segments.push({
                    from: stops[i].station,
                    to: stops[i + 1].station,
                    seatsAvailable: seats !== undefined ? Number(seats) : 0
                });
            }
            updateData.segments = segments;
        }

        const updatedTrain = await Train.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!updatedTrain) return res.status(404).json({ error: "Train not found" });

        res.status(200).json({ message: "Train updated successfully!", train: updatedTrain });
    } catch (err) {
        console.error("Update train error:", err);
        res.status(500).json({ error: err.message || "Server error." });
    }
});

// DELETE TRAIN
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deletedTrain = await Train.findByIdAndDelete(req.params.id);
        if (!deletedTrain) return res.status(404).json({ error: "Train not found" });
        res.status(200).json({ message: "Train deleted successfully" });
    } catch (err) {
        console.error("Delete train error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

// STOPS MANAGEMENT

// ADD STOP
router.post("/:id/stops", verifyToken, async (req, res) => {
    try {
        const { station, arrival, departure, km, order } = req.body;
        if (!station) return res.status(400).json({ error: "Station is required" });

        const train = await Train.findById(req.params.id);
        if (!train) return res.status(404).json({ error: "Train not found" });

        train.stops.push(normalizeStop({ station, arrival, departure, km, order }, train.stops.length));
        train.stops.sort((a, b) => a.order - b.order);
        train.regenerateSegments();
        train.fare = train.stops.length >= 2 ? (train.stops[train.stops.length - 1].km - train.stops[0].km) * 2 : 0;

        await train.save();
        res.status(201).json({ message: "Stop added successfully!", train });
    } catch (err) {
        console.error("Add stop error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

// UPDATE STOP
router.put("/:id/stops/:stopId", verifyToken, async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        if (!train) return res.status(404).json({ error: "Train not found" });

        const stop = train.stops.id(req.params.stopId);
        if (!stop) return res.status(404).json({ error: "Stop not found" });

        const { station, arrival, departure, km, order } = req.body;
        Object.assign(stop, normalizeStop({ station, arrival, departure, km, order }, stop.order));

        train.stops.sort((a, b) => a.order - b.order);
        train.regenerateSegments();
        train.fare = train.stops.length >= 2 ? (train.stops[train.stops.length - 1].km - train.stops[0].km) * 2 : 0;

        await train.save();
        res.status(200).json({ message: "Stop updated successfully!", train });
    } catch (err) {
        console.error("Update stop error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

// DELETE STOP
router.delete("/:id/stops/:stopId", verifyToken, async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        if (!train) return res.status(404).json({ error: "Train not found" });

        const stop = train.stops.id(req.params.stopId);
        if (!stop) return res.status(404).json({ error: "Stop not found" });

        stop.deleteOne();
        train.stops.sort((a, b) => a.order - b.order);
        train.regenerateSegments();
        train.fare = train.stops.length >= 2 ? (train.stops[train.stops.length - 1].km - train.stops[0].km) * 2 : 0;

        await train.save();
        res.status(200).json({ message: "Stop deleted successfully!", train });
    } catch (err) {
        console.error("Delete stop error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

module.exports = router;
