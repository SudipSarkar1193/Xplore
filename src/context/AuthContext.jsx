import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";

// Function to decode JWT payload
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem("jwt") || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (authToken) {
                const decodedToken = parseJwt(authToken);
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    try {
                        const res = await fetch(`${backendServer}/api/users/me`, {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                            },
                        });
                        const data = await res.json();
                        if (res.ok) {
                            setAuthUser(data);
                        } else {
                            logout(); // Token is invalid on the server
                        }
                    } catch (error) {
                        console.error("Error fetching current user:", error);
                        logout();
                    }
                } else {
                    logout(); // Token has expired
                }
            }
            setIsLoading(false);
        };

        fetchCurrentUser();
    }, [authToken]);

    const login = (token) => {
        localStorage.setItem("jwt", token);
        setAuthToken(token);
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        setAuthToken(null);
        setAuthUser(null);
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ authUser, isLoading, login, logout, authToken }}>
            {children}
        </AuthContext.Provider>
    );
};