import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";

function SearchTrains() {
    const [query, setQuery] = useState("");
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [trains, setTrains] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Search by Train Name or Number
    const handleSearchByQuery = async () => {
        if (!query) {
            setMessage("Please enter train name or number.");
            setTrains([]);
            return;
        }

        try {
            const res = await axios.get(`/trains/search?q=${query}`);
            if (res.data.length === 0) {
                setMessage("No trains found for this search.");
            } else {
                setMessage("");
            }
            setTrains(res.data);
        } catch (err) {
            console.error(err.response || err);
            alert("Search Failed! Check console for details.");
        }
    };

    // Search by Source and Destination
    const handleSearchByStations = async () => {
        if (!source || !destination) {
            setMessage("Please enter both source and destination.");
            setTrains([]);
            return;
        }

        try {
            const res = await axios.get(`/trains/search?source=${source}&destination=${destination}`);
            if (res.data.length === 0) {
                setMessage("No trains found for this route.");
            } else {
                setMessage("");
            }
            setTrains(res.data);
        } catch (err) {
            console.error(err.response || err);
            alert("Search Failed! Check console for details.");
        }
    };

    return (
        <div className="search-container">
            <h2 className="search-title">Search Trains</h2>

            {/* Search by Source and Destination */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="From Station"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="To Station"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="search-input"
                />
                <button onClick={handleSearchByStations} className="search-button">
                    Search by Route
                </button>
            </div>

            {/* Search by Name or Number */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Enter Train Name or Number"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button onClick={handleSearchByQuery} className="search-button">
                    Search
                </button>
            </div>

            {/* Message */}
            {message && <p className="search-message">{message}</p>}

            {/* Search Results */}
            <ul className="search-list">
                {trains.map((train) => (
                    <li key={train._id} className="search-item" onClick={() => navigate(`/train-route/${train._id}`)} 
                        style={{ cursor: "pointer" }}
                    >
                        {train.trainNumber} - {train.name} ({train.source} → {train.destination})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SearchTrains;
