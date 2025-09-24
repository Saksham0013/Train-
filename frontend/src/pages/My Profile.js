import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                });
                console.log("Profile data:", res.data);
                if (res.data && res.data.name && res.data.email && res.data._id && res.data.role) {
                    setUserData(res.data);
                } else {
                    setError("Profile data is incomplete.");
                }
            } catch (err) {
                console.error("Profile fetch failed:", err.response ? err.response.data : err);
                setError("Failed to load profile. Please login again.");
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading profile...</p>;

    if (error) return <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>{error}</p>;

    return (
        <div className="profile-page">
            <h1 className="profile-title">My Profile</h1>
            {userData ? (
                <div className="profile-card">
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>User ID:</strong> {userData._id}</p>
                    <p><strong>Role:</strong> {userData.role}</p>
                </div>
            ) : (
                <p style={{ textAlign: "center" }}>No profile data available.</p>
            )}
        </div>
    );
}

export default Profile;
