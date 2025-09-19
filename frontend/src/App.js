import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/My Profile";
import SearchTrains from "./pages/SearchTrains";
import TrainRoute from "./pages/TrainRoute";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/AdminDashboard";
import BookingForm from "./components/BookingForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import "./App.css";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchTrains />} />
        <Route path="/train-route/:trainId" element={<TrainRoute />} />

        {/* Booking form with trainId param */}
        <Route path="/BookingForm/:trainId" element={<BookingForm />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* Admin-only route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
