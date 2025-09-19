import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
    const navigate = useNavigate();
    const { isLoggedIn, role, logout } = useContext(AuthContext);

    return (
        <header className="header">
            <Link to="/" className="logo">🚆 TrainBook</Link>

            <nav>
                <Link to="/">Home</Link>
                <Link to="/search">Search Trains</Link>

                {isLoggedIn ? (
                    <>
                        {role === "user" && (
                            <>
                                <Link to="/bookings">My Bookings</Link>
                                <Link to="/profile">My Profile</Link>
                            </>
                        )}
                        {role === "admin" && (
                            <>
                                <Link to="/bookings">My Bookings</Link>
                                <Link to="/admin">Admin Dashboard</Link>
                                <Link to="/profile">My Profile</Link>
                            </>
                        )}
                        <button
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Signup</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
