import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/signup",
                formData,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!res.data) {
                throw new Error("Invalid server response");
            }

            setSuccessMsg(res.data.message || "Signup successful!");

            if (res.data.token && res.data.user) {
                // Save to localStorage
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("role", res.data.user.role || "user");

                if (res.data.user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/profile");
                }
            } else {
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setErrorMsg(
                err.response?.data?.message ||
                    "Something went wrong, please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>

                {errorMsg && <p className="error-text">{errorMsg}</p>}
                {successMsg && <p className="success-text">{successMsg}</p>}

                <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
                <div className="password-field">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                </button>

                <p className="form-footer">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="form-link"
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Signup;
