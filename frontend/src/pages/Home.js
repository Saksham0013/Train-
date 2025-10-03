import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [trains, setTrains] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrains = async () => {
            try {
                const res = await axios.get("https://train-i3lw.onrender.com/api/trains");
                setTrains(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch trains:", err);
                setTrains([]);
            }
        };
        fetchTrains();
    }, []);

    const handleBookTicket = (train) => {
        // always allow booking, even if seats = 0
        navigate(`/BookingForm/${train._id}`);
    };

    const handleCardClick = (train) => {
        navigate(`/train-route/${train._id}`);
    };

    return (
        <div className="home">
            <h1>Available Trains</h1>
            <div className="train-list">
                {trains.length > 0 ? (
                    trains.map((train) => (
                        <div
                            key={train._id}
                            className="train-card"
                            onClick={() => handleCardClick(train)}
                            style={{ cursor: "pointer" }}
                        >
                            <h2>
                                {train.name} ({train.trainNumber})
                            </h2>
                            <p>
                                {train.source} → {train.destination}
                            </p>
                            <p>Departure: {train.departureTime}</p>
                            <p>Arrival: {train.arrivalTime}</p>
                            <p>Seats: {train.seats}</p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookTicket(train);
                                }}
                            >
                                {train.seats > 0 ? "Book Ticket" : "Book Ticket"}
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No trains available.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
