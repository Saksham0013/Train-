import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import EditTrainForm from "../pages/EditForm";

export default function TrainList({ newTrainAdded }) {
    const [trains, setTrains] = useState([]);
    const [editTrain, setEditTrain] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchTrains();
    }, []);

    useEffect(() => {
        if (newTrainAdded) {
            setTrains((prev) => [newTrainAdded, ...prev]);
        }
    }, [newTrainAdded]);

    const fetchTrains = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/trains");
            setTrains(res.data);
        } catch (err) {
            console.error("Error fetching trains:", err);
        }
    };

    const deleteTrain = async (id) => {
        if (!window.confirm("Delete this train?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/trains/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrains(trains.filter((t) => t._id !== id));
        } catch (err) {
            console.error("Error deleting train:", err);
        }
    };

    const handleTrainUpdated = (updatedTrain) => {
        setTrains((prev) =>
            prev.map((t) => (t._id === updatedTrain._id ? updatedTrain : t))
        );
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Trains</h2>
            <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Train Name</th>
                        <th>Number</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Seats</th>
                        {/* <th>Price</th> */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trains.map(train => (
                        <tr key={train._id}>
                            <td>{train.name}</td>
                            <td>{train.trainNumber}</td>
                            <td>{train.source}</td>
                            <td>{train.destination}</td>
                            <td>{train.departureTime}</td>
                            <td>{train.arrivalTime}</td>
                            <td>{train.seats}</td>
                            {/* <td>₹{train.price}</td> */}
                            <td>
                                <button onClick={() => setEditTrain(train)} style={{ marginRight: "5px" }}>Edit</button>
                                <button onClick={() => deleteTrain(train._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editTrain && (
                <EditTrainForm
                    train={editTrain}
                    setEditTrain={setEditTrain}
                    onUpdated={handleTrainUpdated}
                />
            )}
        </div>
    );
}
