import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";

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
						// Token is invalid or expired
						localStorage.removeItem("jwt");
						setAuthToken(null);
						setAuthUser(null);
					}
				} catch (error) {
					console.error("Error fetching current user:", error);
					localStorage.removeItem("jwt");
					setAuthToken(null);
					setAuthUser(null);
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