import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useFollow = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { mutateAsync: follow, isPending } = useMutation({
		mutationFn: async (userUuid) => {
			console.log("Attempting to follow/unfollow user with UUID:", userUuid);
			if (!authToken) {
				throw new Error("User is not authenticated");
			}

			const res = await fetch(`${backendServer}/api/users/${userUuid}/follow`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Something went wrong!");
			return data;
		},

		onMutate: async (userUuid) => {
			console.log("🔄 Starting optimistic update for user:", userUuid);

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: ["userFollowers"] });
			await queryClient.cancelQueries({ queryKey: ["userFollowing"] });
			await queryClient.cancelQueries({ queryKey: ["suggestedUsers"] });
			await queryClient.cancelQueries({ queryKey: ["userProfile"] });
			await queryClient.cancelQueries({ queryKey: ["posts"] }); // Users might appear in post data

			// Snapshot of ALL query data that might contain users
			const previousData = {
				userFollowers: queryClient.getQueriesData({ queryKey: ["userFollowers"] }),
				userFollowing: queryClient.getQueriesData({ queryKey: ["userFollowing"] }),
				suggestedUsers: queryClient.getQueriesData({ queryKey: ["suggestedUsers"] }),
				userProfile: queryClient.getQueriesData({ queryKey: ["userProfile"] }),
				posts: queryClient.getQueriesData({ queryKey: ["posts"] }), // In case users appear in post data
			};

			// Helper function to update a single user's follow status
			const updateUserFollowStatus = (user) => {
				if (user.uuid === userUuid || user.userUuid === userUuid) {
					const updated = {
						...user,
						currentUserFollowing: !user.currentUserFollowing,
					};
					console.log("✅ Updated user:", {
						uuid: userUuid,
						username: user.username,
						oldStatus: user.currentUserFollowing,
						newStatus: updated.currentUserFollowing,
					});
					return updated;
				}
				return user;
			};

			// Helper function to recursively update users in nested structures
			const updateUsersRecursively = (data) => {
				if (!data) return data;

				// Handle arrays (user lists, search results, etc.)
				if (Array.isArray(data)) {
					return data.map(updateUsersRecursively);
				}

				// Handle objects
				if (typeof data === "object") {
					let updated = { ...data };
					let hasChanges = false;

					// Check if this object IS a user and update it
					if (data.uuid || data.userUuid) {
						const updatedUser = updateUserFollowStatus(data);
						if (updatedUser !== data) {
							updated = updatedUser;
							hasChanges = true;
						}
					}

					// Recursively check all properties that might contain users
					for (const key in data) {
						if (data[key] && typeof data[key] === "object") {
							const updatedValue = updateUsersRecursively(data[key]);
							if (updatedValue !== data[key]) {
								updated[key] = updatedValue;
								hasChanges = true;
							}
						}
					}

					return hasChanges ? updated : data;
				}

				return data;
			};

			// Update all cached queries that might contain users
			Object.entries(previousData).forEach(([category, queries]) => {
				queries.forEach(([queryKey, data]) => {
					if (data) {
						const updated = updateUsersRecursively(data);
						queryClient.setQueryData(queryKey, updated);
						console.log(`📊 Updated ${category} query:`, queryKey);
					}
				});
			});

			return previousData;
		},

		onError: (err, userUuid, context) => {
			console.error("❌ Follow operation failed, rolling back:", err.message);
			toast.error(err.message || "Could not update follow status.");

			// Rollback all changes
			if (context) {
				Object.entries(context).forEach(([category, queries]) => {
					queries.forEach(([queryKey, data]) => {
						queryClient.setQueryData(queryKey, data);
					});
				});
				console.log("🔄 Rolled back all optimistic updates");
			}
		},

		onSuccess: (data, userUuid) => {
			console.log("✅ Follow operation succeeded for user:", userUuid);
			toast.success(data.message || "Follow status updated!");
		},
	});

	return { follow, isPending };
};

export default useFollow;