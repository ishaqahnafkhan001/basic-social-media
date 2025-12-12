import { useState, useEffect } from "react";

export default function useUser() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Load User on Mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data", error);
                // If data is corrupt, clear it
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
            }
        }
        setIsLoading(false);
    }, []);

    // 2. Logout Function
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    // 3. Helper: Get Initials (e.g. "John Doe" -> "JD")
    const getInitials = () => {
        if (!user || !user.name) return "U";
        return user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // 4. Return everything in a nice package
    return {
        userName: user?.name,
        user,                       // The full object: { name, email, role, _id ... }
        isLoading,                  // True while loading from localStorage
        isLoggedIn: !!user,         // True if user exists
        isAdmin: user?.role === "admin",
        isAgency: user?.role === "agency",
        role: user?.role,
        initials: getInitials(),
        logout
    };
}