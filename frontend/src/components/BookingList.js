import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/admin/bookings", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res.data);
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            }
        };
        fetchBookings();
    }, [token]);

    return (
        <div>
            <h2>All Bookings</h2>
            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Train</th>
                        <th>Route</th>
                        <th>seats</th>
                        {/* <th>Passengers</th> */}
                        <th>Distance</th>
                        <th>Fare</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length > 0 ? (
                        bookings.map(b => (
                            <tr
                                key={b._id}
                                style={{ backgroundColor: b.status === "Cancelled" ? "#f8d7da" : "transparent" }}
                            >
                                <td>{b.user?.name || "N/A"}</td>
                                <td>{b.user?.email || "N/A"}</td>
                                <td>{b.train?.name || "N/A"}</td>
                                <td>
                                    {b.startStation && b.endStation
                                        ? `${b.startStation} → ${b.endStation}`
                                        : b.train
                                            ? `${b.train.source} → ${b.train.destination}`
                                            : "N/A"}
                                </td>
                                <td>{b.seats}</td>
                                {/* <td>{b.passengers}</td> */}
                                <td>{b.distance} km</td>
                                <td>₹{b.fare}</td>
                                <td>{b.status}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center" }}>No bookings found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
