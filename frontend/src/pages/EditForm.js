import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function EditTrainForm({ train, setEditTrain, onUpdated }) {
    const [formData, setFormData] = useState({
        trainNumber: "",
        name: "",
        source: "",
        destination: "",
        departureTime: "",
        arrivalTime: "",
        seats: 0,
        price: 0,
        stops: [],
        destinationKm: 0,
    });

    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (train) {
            const stopsExcludingDestination =
                train.stops && train.stops.length > 0
                    ? train.stops.slice(0, -1) 
                    : [];

            setFormData({
                trainNumber: train.trainNumber || "",
                name: train.name || "",
                source: train.source || "",
                destination: train.destination || "",
                departureTime: train.departureTime || "",
                arrivalTime: train.arrivalTime || "",
                seats: train.seats || 0,
                price: train.price || 0,
                stops: stopsExcludingDestination,
                destinationKm:
                    train.stops && train.stops.length > 0
                        ? train.stops[train.stops.length - 1].km
                        : 0,
            });
        }
    }, [train]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleStopChange = (index, field, value) => {
        const newStops = [...formData.stops];
        newStops[index][field] = field === "km" ? Number(value) : value;
        setFormData((prev) => ({ ...prev, stops: newStops }));
    };

    const addStop = () => {
        setFormData((prev) => ({
            ...prev,
            stops: [...prev.stops, { station: "", arrival: "", departure: "", km: 0 }],
        }));
    };

    const removeStop = (index) => {
        const newStops = formData.stops.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, stops: newStops }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { _id, ...dataToSend } = formData;

            // Construct final stops including destination
            const stopsWithDestination = [
                ...dataToSend.stops,
                {
                    station: dataToSend.destination,
                    arrival: dataToSend.arrivalTime,
                    departure: "--",
                    km: dataToSend.destinationKm,
                },
            ];

            const res = await axios.put(
                `https://train-i3lw.onrender.com/api/trains/${train._id}`,
                { ...dataToSend, stops: stopsWithDestination },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onUpdated(res.data);
            setEditTrain(null);
        } catch (err) {
            console.error("Error updating train:", err);
            if (err.response?.status === 403) {
                alert("You are not authorized to update this train.");
            } else {
                alert("Failed to update train. Check console for details.");
            }
        }
    };

    return (
        <div className="edit-modal-overlay">
            <div className="edit-modal-content">
                <h3>Edit Train</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        name="trainNumber"
                        value={formData.trainNumber}
                        onChange={handleChange}
                        placeholder="Train Number"
                        required
                    />
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                    />
                    <input
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        placeholder="Source"
                        required
                    />
                    <input
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="Destination"
                        required
                    />
                    <input
                        name="departureTime"
                        value={formData.departureTime}
                        onChange={handleChange}
                        placeholder="Departure Time"
                    />
                    <input
                        name="arrivalTime"
                        value={formData.arrivalTime}
                        onChange={handleChange}
                        placeholder="Arrival Time"
                    />
                    <input
                        type="number"
                        name="seats"
                        value={formData.seats}
                        onChange={handleChange}
                        placeholder="Seats"
                    />
                    <input
                        type="number"
                        name="destinationKm"
                        value={formData.destinationKm}
                        onChange={handleChange}
                        placeholder="Destination Distance (km)"
                    />

                    <h4>Stops</h4>
                    {formData.stops.map((stop, index) => (
                        <div key={index} className="stop-item">
                            <input
                                placeholder="Station"
                                value={stop.station}
                                onChange={(e) =>
                                    handleStopChange(index, "station", e.target.value)
                                }
                                required
                            />
                            <input
                                placeholder="Arrival Time"
                                value={stop.arrival}
                                onChange={(e) =>
                                    handleStopChange(index, "arrival", e.target.value)
                                }
                            />
                            <input
                                placeholder="Departure Time"
                                value={stop.departure}
                                onChange={(e) =>
                                    handleStopChange(index, "departure", e.target.value)
                                }
                            />
                            <input
                                type="number"
                                placeholder="Distance (km)"
                                value={stop.km}
                                onChange={(e) => handleStopChange(index, "km", e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeStop(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addStop}>
                        Add Stop
                    </button>

                    <div className="modal-buttons">
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setEditTrain(null)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
