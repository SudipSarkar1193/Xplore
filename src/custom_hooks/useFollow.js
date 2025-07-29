// src/custom_hooks/useFollow.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useFollow = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation({
		mutationFn: async (userUuid) => { // Now accepts the user's UUID
			try {
				const res = await fetch(`${backendServer}/api/users/${userUuid}/follow`, { // Updated endpoint
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${authToken}`, // Add JWT
					},
				});

				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (data) => {
			toast.success(data.message);
			// Invalidate queries to refetch profile and suggestion data
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { follow, isPending };
};

export default useFollow;