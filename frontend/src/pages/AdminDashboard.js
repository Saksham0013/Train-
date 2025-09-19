import React, { useState } from "react";
import TrainList from "../components/TrainList";
import UserList from "../components/UserList";
import BookingList from "../components/BookingList";
import AddTrain from "./AddTrain";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("trains");

    return (
        <div className="admin-dashboard">
            <aside className="sidebar">
                <h2>Admin Panel</h2>
                <button
                    className={activeTab === "trains" ? "active" : ""}
                    onClick={() => setActiveTab("trains")}
                >
                    Trains
                </button>
                <button
                    className={activeTab === "addtrain" ? "active" : ""}
                    onClick={() => setActiveTab("addtrain")}
                >
                    Add Train
                </button>
                <button
                    className={activeTab === "users" ? "active" : ""}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={activeTab === "bookings" ? "active" : ""}
                    onClick={() => setActiveTab("bookings")}
                >
                    Bookings
                </button>
            </aside>

            <main className="main-content">
                {activeTab === "addtrain" && <AddTrain />}
                {activeTab === "trains" && <TrainList />}
                {activeTab === "users" && <UserList />}
                {activeTab === "bookings" && <BookingList />}
            </main>
        </div>
    );
};

export default AdminDashboard;
