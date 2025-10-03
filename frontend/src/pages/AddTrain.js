import React, { useState } from "react";
import axios from "axios";

const AddTrain = ({ onTrainAdded }) => {
    const [formData, setFormData] = useState({
        trainNumber: "",
        name: "",
        source: "",
        destination: "",
        departureTime: "",
        arrivalTime: "",
        seats: "",
        price: "",
        stops: [{ station: "", arrivalTime: "", departureTime: "", distance: "" }], 
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleStopChange = (index, e) => {
        const newStops = [...formData.stops];
        newStops[index][e.target.name] =
            e.target.name === "distance" ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, stops: newStops });
    };

    const addStop = () => {
        setFormData({
            ...formData,
            stops: [
                ...formData.stops,
                { station: "", arrivalTime: "", departureTime: "", distance: "" },
            ],
        });
    };

    const removeStop = (index) => {
        const newStops = formData.stops.filter((_, i) => i !== index);
        setFormData({ ...formData, stops: newStops });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            const payload = {
                ...formData,
                seats: Number(formData.seats || 0),
                price: Number(formData.price || 0),
            };

            const token = localStorage.getItem("token");
            if (!token) throw new Error("You must be logged in to add a train.");

            const response = await axios.post(
                "https://train-i3lw.onrender.com/api/trains",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(response.data.message);
            setIsError(false);
            setFormData({
                trainNumber: "",
                name: "",
                source: "",
                destination: "",
                departureTime: "",
                arrivalTime: "",
                seats: "",
                price: "",
                stops: [{ station: "", arrivalTime: "", departureTime: "", distance: "" }],
            });

            if (onTrainAdded) onTrainAdded(response.data.train);
        } catch (err) {
            console.error("Error adding train:", err);
            const errorMsg =
                err.response?.data?.error || err.message || "Error adding train";
            setMessage(errorMsg);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-train">
            <h2>Add New Train</h2>
            {message && <p className={`message ${isError ? "error" : ""}`}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="trainNumber"
                    placeholder="Train Number"
                    value={formData.trainNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="name"
                    placeholder="Train Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="source"
                    placeholder="Source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                />
                <input
                    type="time"
                    name="departureTime"
                    placeholder="Departure Time"
                    value={formData.departureTime}
                    onChange={handleChange}
                    required
                />
                <input
                    type="time"
                    name="arrivalTime"
                    placeholder="Arrival Time"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="seats"
                    placeholder="Seats"
                    value={formData.seats}
                    onChange={handleChange}
                />

                {/* Stops Section */}
                <div className="stops-section">
                    <h3>Stops</h3>
                    {formData.stops.map((stop, index) => (
                        <div key={index} className="stop">
                            <input
                                type="text"
                                name="station"
                                placeholder="Station Name"
                                value={stop.station}
                                onChange={(e) => handleStopChange(index, e)}
                                required
                            />
                            <input
                                type="time"
                                name="arrivalTime"
                                placeholder="Arrival Time"
                                value={stop.arrivalTime}
                                onChange={(e) => handleStopChange(index, e)}
                            />
                            <input
                                type="time"
                                name="departureTime"
                                placeholder="Departure Time"
                                value={stop.departureTime}
                                onChange={(e) => handleStopChange(index, e)}
                            />
                            <input
                                type="number"
                                name="distance"
                                placeholder="Distance (km)"
                                value={stop.distance}
                                onChange={(e) => handleStopChange(index, e)}
                                required
                            />
                            {formData.stops.length > 1 && (
                                <button type="button" onClick={() => removeStop(index)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addStop}>
                        Add Stop
                    </button>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Train"}
                </button>
            </form>
        </div>
    );
};

export default AddTrain;
