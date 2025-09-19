import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");

        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (newToken, userRole) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", userRole);
        setToken(newToken);
        setRole(userRole);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, role, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
