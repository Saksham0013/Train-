const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");

dotenv.config();

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000", 
        credentials: true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("🚆 TrainBook API is running...");
});

const startServer = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in .env file");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected Successfully");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Server Startup Error:", err.message);
        process.exit(1); 
    }
};

startServer();

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});
