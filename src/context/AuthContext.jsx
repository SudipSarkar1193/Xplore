import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Function to decode JWT payload
const parseJwt = (token) => {
	try {
		return JSON.parse(atob(token.split(".")[1]));
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
	const [authToken, setAuthToken] = useState(
		localStorage.getItem("jwt") || null
	);
	const [isLoading, setIsLoading] = useState(true);

	const queryClient = useQueryClient();

	const { data: unreadCount, refetch: refetchUnreadCount } = useQuery({
		queryKey: ["unreadNotificationCount"],
		queryFn: async () => {
			if (!authToken) return 0;
			try {
				const res = await fetch(
					`${backendServer}/api/v1/notifications/unread-count`,
					{
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Failed to fetch count");
				return data.count;
			} catch (error) {
				console.error("Failed to fetch unread count:", error);
				return 0;
			}
		},
		enabled: !!authToken,
		refetchOnWindowFocus: false, // prevent refetching on window focus
	});

	// Polling for the unread count
	useEffect(() => {
		if (!authToken) return;
		const intervalId = setInterval(() => {
			refetchUnreadCount();
		}, 15000); // Poll every 15 seconds

		return () => clearInterval(intervalId);
	}, [authToken, refetchUnreadCount]);

	const logout = useCallback(() => {
		localStorage.removeItem("jwt");
		setAuthToken(null);
		setAuthUser(null);
		queryClient.clear(); // Clear all query cache on logout
		toast.success("Logged out successfully");
	}, [queryClient]);

	const fetchCurrentUser = useCallback(async () => {
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
	}, [authToken, logout]);

	const refreshUser = useCallback(async () => {
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
				}
			} catch (error) {
				console.error("Error refreshing user data:", error);
			}
		}
	}, [authToken]);

	useEffect(() => {
		fetchCurrentUser();
	}, [fetchCurrentUser]);

	const login = (token) => {
		localStorage.setItem("jwt", token);
		setAuthToken(token);
	};

	const value = {
		authUser,
		isLoading,
		login,
		logout,
		authToken,
		refreshUser,
		refetchUnreadCount,
		unreadCount: unreadCount || 0,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};