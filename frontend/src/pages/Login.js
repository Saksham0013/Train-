import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const {login} = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            if (!res.data.token || !res.data.user) {
                throw new Error("Invalid response from server");
            }

            // Save to localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem(
                "role",
                res.data.user.role || (res.data.user.isAdmin ? "admin" : "user")
            );

            login(res.data.token,res.data.user.role)
            
            // Navigate based on role
            if (res.data.user.role === "admin" || res.data.user.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/profile");
            }
        } catch (err) {
            console.error("Login error:", err);
            setErrorMsg(
                err.response?.data?.message || "Something went wrong, please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {errorMsg && <p className="error-text">{errorMsg}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={loading}
                />

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
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
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="form-footer">
                    Don&apos;t have an account?{" "}
                    <span
                        onClick={() => navigate("/signup")}
                        className="form-link"
                    >
                        Signup
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;
