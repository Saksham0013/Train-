import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function BookingForm() {
    const { token } = useContext(AuthContext);
    const { trainId: paramTrainId } = useParams();
    const navigate = useNavigate();

    const [trains, setTrains] = useState([]);
    const [trainId, setTrainId] = useState(paramTrainId || "");
    const [startStation, setStartStation] = useState("");
    const [endStation, setEndStation] = useState("");
    const [seats, setSeats] = useState(1);
    const [loading, setLoading] = useState(true);
    const [price, setPrice] = useState(0);
    const [journeyDate, setJourneyDate] = useState("");

    const [passenger, setPassenger] = useState({
        name: "",
        phone: "",
        age: "",
        email: "",
        aadhar: "",
        address: ""
    });

    // Fetch trains
    useEffect(() => {
        const fetchTrains = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/trains");
                setTrains(res.data);

                if (paramTrainId && !res.data.find((t) => t._id === paramTrainId)) {
                    setTrainId("");
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch trains:", err);
                setLoading(false);
            }
        };
        fetchTrains();
    }, [paramTrainId]);

    // Calculate price
    useEffect(() => {
        if (!trainId || !startStation || !endStation) {
            setPrice(0);
            return;
        }

        const train = trains.find((t) => t._id === trainId);
        if (!train) return;

        const stops = train.stops || [];
        const startIndex = stops.findIndex((r) => r.station === startStation);
        const endIndex = stops.findIndex((r) => r.station === endStation);

        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
            setPrice(0);
            return;
        }

        const numStops = endIndex - startIndex;
        setPrice(numStops * train.price * seats);
    }, [trainId, startStation, endStation, seats, trains]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!trainId || !startStation || !endStation || !journeyDate) {
            return alert("Please select train, stations, and journey date.");
        }

        try {
            const bookingData = {
                trainId,
                seats,
                startStation,
                endStation,
                passenger,
                journeyDate, // match backend field name
                price
            };

            const res = await axios.post(
                "http://localhost:5000/api/bookings",
                bookingData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(res.data.message);

            // Reset form
            setSeats(1);
            setStartStation("");
            setEndStation("");
            setJourneyDate("");
            setPassenger({
                name: "",
                phone: "",
                age: "",
                email: "",
                aadhar: "",
                address: ""
            });
            setPrice(0);

            // Navigate to user's bookings page
            navigate("/my-bookings");
        } catch (err) {
            console.error("Booking error:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Booking failed. Please try again.");
        }
    };

    if (loading) return <p>Loading trains...</p>;

    const train = trains.find((t) => t._id === trainId);
    const stopsOptions = train?.stops || [];

    return (
        <div className="booking-form-container">
            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "500px",
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}
            >
                <h3>Book Train</h3>

                {/* Train Selection */}
                <label>
                    Train:
                    <select
                        value={trainId}
                        onChange={(e) => {
                            setTrainId(e.target.value);
                            setStartStation("");
                            setEndStation("");
                        }}
                        required
                    >
                        <option value="">-- Select train --</option>
                        {trains.map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.name} - {t.source} → {t.destination} ({t.seats} seats available)
                            </option>
                        ))}
                    </select>
                </label>

                {/* Start and End Stations */}
                {trainId && stopsOptions.length > 0 && (
                    <>
                        <label>
                            Start Station:
                            <select
                                value={startStation}
                                onChange={(e) => {
                                    setStartStation(e.target.value);
                                    setEndStation("");
                                }}
                                required
                            >
                                <option value="">-- Select start station --</option>
                                {stopsOptions.map((s, idx) => (
                                    <option key={idx} value={s.station}>
                                        {s.station} ({s.arrival} → {s.departure})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            End Station:
                            <select
                                value={endStation}
                                onChange={(e) => setEndStation(e.target.value)}
                                required
                            >
                                <option value="">-- Select end station --</option>
                                {stopsOptions
                                    .filter((s, idx) =>
                                        startStation
                                            ? idx > stopsOptions.findIndex((st) => st.station === startStation)
                                            : true
                                    )
                                    .map((s, idx) => (
                                        <option key={idx} value={s.station}>
                                            {s.station} ({s.arrival} → {s.departure})
                                        </option>
                                    ))}
                            </select>
                        </label>
                    </>
                )}

                {/* Date Selection */}
                <label>
                    Journey Date:
                    <input
                        type="date"
                        value={journeyDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        required
                    />
                </label>

                {/* Seats */}
                <label>
                    Number of Seats:
                    <input
                        type="number"
                        value={seats}
                        min={1}
                        onChange={(e) => setSeats(Number(e.target.value))}
                        required
                    />
                </label>

                {/* Price */}
                {price > 0 && <p>Total Price: ₹{price}</p>}

                {/* Passenger Details */}
                <h4>Passenger Details</h4>
                <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={passenger.name}
                    onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                />
                <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={passenger.phone}
                    onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Age"
                    required
                    value={passenger.age}
                    onChange={(e) => setPassenger({ ...passenger, age: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={passenger.email}
                    onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Aadhar Card Number"
                    required
                    value={passenger.aadhar}
                    onChange={(e) => setPassenger({ ...passenger, aadhar: e.target.value })}
                />
                <textarea
                    placeholder="Address"
                    required
                    value={passenger.address}
                    onChange={(e) => setPassenger({ ...passenger, address: e.target.value })}
                ></textarea>

                <button
                    type="submit"
                    disabled={!trainId || !startStation || !endStation || !journeyDate || seats < 1}
                >
                    Book
                </button>
            </form>
        </div>
    );
}
