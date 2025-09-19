const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  station: { type: String, required: true },
  arrival: { type: String, required: true },
  departure: { type: String, required: true },
  km: { type: Number, required: true },
  order: { type: Number, required: true }
});

const segmentSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  seatsAvailable: { type: Number, required: true }
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  seats: { type: Number, required: true },
  stops: [stopSchema],
  segments: [segmentSchema],
  fare: { type: Number }
}, { timestamps: true });

// Helper to calculate fare
function calculateFare(stops) {
  if (!stops || stops.length < 2) return 0;
  const firstKm = Number(stops[0].km) || 0;
  const lastKm = Number(stops[stops.length - 1].km) || 0;
  return Math.max(lastKm - firstKm, 0) * 2;
}

// Regenerate segments helper
trainSchema.methods.regenerateSegments = function () {
  const segments = [];
  for (let i = 0; i < this.stops.length - 1; i++) {
    segments.push({
      from: this.stops[i].station,
      to: this.stops[i + 1].station,
      seatsAvailable: Number(this.seats) || 0
    });
  }
  this.segments = segments;
};

// Pre-save hook
trainSchema.pre("save", function (next) {
  // Validate stops
  if (this.stops && Array.isArray(this.stops)) {
    this.stops.forEach((stop, idx) => {
      if (!stop.station) throw new Error(`Stop ${idx + 1}: station is required`);
      if (!stop.arrival) stop.arrival = "--";
      if (!stop.departure) stop.departure = "--";
      stop.km = Number(stop.km) || 0;
      stop.order = Number(stop.order) || idx;
    });
  }
  this.fare = calculateFare(this.stops);
  this.regenerateSegments();
  next();
});

// Pre-update hook
trainSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();
  if (update.stops && Array.isArray(update.stops)) {
    update.stops.forEach((stop, idx) => {
      stop.km = Number(stop.km) || 0;
      stop.order = Number(stop.order) || idx;
      if (!stop.arrival) stop.arrival = "--";
      if (!stop.departure) stop.departure = "--";
    });
    update.fare = calculateFare(update.stops);

    // regenerate segments
    const segments = [];
    for (let i = 0; i < update.stops.length - 1; i++) {
      segments.push({
        from: update.stops[i].station,
        to: update.stops[i + 1].station,
        seatsAvailable: update.seats !== undefined ? Number(update.seats) : 0
      });
    }
    update.segments = segments;
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model("Train", trainSchema);
