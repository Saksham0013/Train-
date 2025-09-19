import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TrainRoute = () => {
    const { trainId } = useParams();
    const [train, setTrain] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrain = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/trains/${trainId}`);
                setTrain(res.data);
            } catch (err) {
                console.error("Failed to fetch train details:", err);
            }
        };
        fetchTrain();
    }, [trainId]);

    if (!train) return <p>Loading train route...</p>;

    const totalDistance =
        train.stops && train.stops.length > 0
            ? train.stops[train.stops.length - 1].km
            : 0;

    // Only include user-added stops, don't duplicate source/destination
    const stopsWithEndpoints = [
        { station: train.source, arrival: "--", departure: train.departureTime, km: 0 },
        ...(train.stops
            ? train.stops.filter(
                (stop) => stop.station !== train.source && stop.station !== train.destination
            )
            : []),
        { station: train.destination, arrival: train.arrivalTime, departure: "--", km: totalDistance },
    ];

    return (
        <div className="train-route-page">
            <h1>
                {train.name} ({train.trainNumber})
            </h1>
            <p>
                <strong>Route:</strong> {train.source} → {train.destination}
            </p>
            <p>
                <strong>Departure:</strong> {train.departureTime} |{" "}
                <strong>Arrival:</strong> {train.arrivalTime}
            </p>

            <h2>Train Stops:</h2>
            {stopsWithEndpoints.length > 0 ? (
                <div className="timeline">
                    {stopsWithEndpoints.map((stop, index) => {
                        const isStart = index === 0;
                        const isEnd = index === stopsWithEndpoints.length - 1;
                        return (
                            <div
                                className={`stop ${isStart ? "start" : ""} ${isEnd ? "end" : ""}`}
                                key={index}
                            >
                                <div className="circle" />
                                <div className="info">
                                    <h3>{stop.station}</h3>
                                    <p>
                                        Arrival: {stop.arrival || "N/A"} | Departure: {stop.departure || "N/A"}
                                    </p>
                                    {stop.km !== undefined && (
                                        <p>Distance from start: {stop.km} km</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No route details available</p>
            )}

            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default TrainRoute;
