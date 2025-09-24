import React, { useEffect, useState, useRef } from "react";
import axios from "../api";
import html2pdf from "html2pdf.js";
// import { QRCodeSVG } from "qrcode.react";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const ticketRef = useRef();

    // Fetch bookings on mount
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/bookings", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedBookings = res.data.map(b => {
                    // Mark waiting list bookings with position
                    if (b.status?.toLowerCase() === "waiting" && b.position) {
                        return { ...b, status: `Waiting (#${b.position})` };
                    }
                    return b;
                });

                setBookings(fetchedBookings);
            } catch (err) {
                console.error("Fetch bookings error:", err);
                alert("Failed to fetch bookings!");
            }
        };
        fetchBookings();
    }, []);

    // Cancel booking (works for confirmed and waiting)
    const cancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this ticket?")) return;

        try {
            const token = localStorage.getItem("token");

            const res = await axios.put(
                `/bookings/${id}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setBookings((prev) =>
                prev.map((b) =>
                    b._id === id ? { ...b, status: "Cancelled" } : b
                )
            );

            if (selectedBooking && selectedBooking._id === id) {
                setSelectedBooking((prev) => ({ ...prev, status: "Cancelled" }));
            }

            alert(res.data.message || "Ticket cancelled successfully!");
        } catch (err) {
            console.error("Cancel booking error:", err);
            const message = err.response?.data?.message || "Failed to cancel ticket!";
            alert(message);
        }
    };

    // Download PDF
    const downloadPDF = () => {
        if (!selectedBooking) return;
        const element = ticketRef.current;
        const opt = {
            margin: 0.5,
            filename: `Ticket_${selectedBooking._id.slice(-8).toUpperCase()}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        html2pdf().from(element).set(opt).save();
    };

    // Print Ticket
    const printTicket = () => {
        if (!selectedBooking || !ticketRef.current) return;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Ticket</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .ticket-card { border: 1px solid #ccc; padding: 20px; width: 400px; margin: auto; }
                        h3 { text-align: center; }
                        hr { margin: 10px 0; }
                        p { margin: 5px 0; }
                        strong { color: #333; }
                        .status-cancelled { color: red; font-weight: bold; }
                        .status-booked { color: green; font-weight: bold; }
                    </style>
                </head>
                <body>
                    ${ticketRef.current.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="bookings-container">
            <h2 className="bookings-title">My Bookings</h2>

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <ul className="bookings-list">
                    {bookings.map((b) => (
                        <li
                            key={b._id}
                            className="bookings-item"
                            onClick={() => setSelectedBooking(b)}
                            style={{ cursor: "pointer" }}
                        >
                            {b.train.name} ({b.train.trainNumber}) -{" "}
                            {b.journeyDate
                                ? new Date(b.journeyDate).toLocaleDateString()
                                : "N/A"} | Seats: {b.seats}
                            <span
                                style={{
                                    marginLeft: "10px",
                                    fontWeight: "bold",
                                    color: b.status.includes("Cancelled") ? "red" : "green",
                                }}
                            >
                                {b.status}
                            </span>
                            {!b.status.includes("Cancelled") && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cancelBooking(b._id);
                                    }}
                                    className="cancel-btn"
                                    style={{
                                        marginLeft: "15px",
                                        padding: "4px 8px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Ticket Modal */}
            {selectedBooking && (
                <div className="ticket-modal">
                    <div className="ticket-card" ref={ticketRef}>
                        <h3 className="ticket-header">🎫 Train e-Ticket</h3>
                        <div className="ticket-body">
                            <p>
                                <strong>PNR:</strong>{" "}
                                <span style={{ color: "#007bff" }}>
                                    {selectedBooking._id.slice(-8).toUpperCase()}
                                </span>
                            </p>
                            <hr />
                            <p>
                                <strong>Train:</strong> {selectedBooking.train.name} (
                                {selectedBooking.train.trainNumber})
                            </p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {selectedBooking.journeyDate
                                    ? new Date(selectedBooking.journeyDate).toLocaleDateString()
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>From → To:</strong> {selectedBooking.startStation} →{" "}
                                {selectedBooking.endStation}
                            </p>
                            <hr />
                            <p>
                                <strong>Passenger:</strong> {selectedBooking.passenger.name},{" "}
                                {selectedBooking.passenger.age} yrs
                            </p>
                            <p>
                                <strong>Seats:</strong> {selectedBooking.seats}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    style={{
                                        color: selectedBooking.status.includes("Cancelled")
                                            ? "red"
                                            : "green",
                                    }}
                                >
                                    {selectedBooking.status}
                                </span>
                            </p>
                            <p>
                                <strong>Fare:</strong> ₹{selectedBooking.price}
                            </p>
                        </div>
                    </div>

                    {/* Ticket Actions */}
                    <div className="ticket-actions">
                        <button className="download-btn" onClick={downloadPDF}>
                            ⬇️ Download PDF
                        </button>
                        <button className="print-btn" onClick={printTicket}>
                            🖨️ Print Ticket
                        </button>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedBooking(null)}
                        >
                            ❌ Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bookings;
