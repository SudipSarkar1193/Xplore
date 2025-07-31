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
			console.log("Using authToken:", authToken);

			// Make the API call to follow/unfollow the user
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
        // This is where the magic happens...
        onMutate: async (userUuid) => {
            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["userFollowers"] });
            await queryClient.cancelQueries({ queryKey: ["userFollowing"] });

            // 2. Snapshot the previous value
            const previousFollowers = queryClient.getQueryData(["userFollowers"]);
            const previousFollowing = queryClient.getQueryData(["userFollowing"]);

            // 3. Optimistically update to the new value
            // We'll update both lists, as the user might appear in either.
            const updateUserInCache = (list) => {
                return list?.map(user => 
                    user.uuid === userUuid 
                        ? { ...user, currentUserFollowing: !user.currentUserFollowing }
                        : user
                );
            };
            
            if (previousFollowers) {
                queryClient.setQueryData(["userFollowers"], updateUserInCache(previousFollowers));
            }
            if (previousFollowing) {
                queryClient.setQueryData(["userFollowing"], updateUserInCache(previousFollowing));
            }

            // 4. Return a context object with the snapshotted value
            return { previousFollowers, previousFollowing };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, userUuid, context) => {
            toast.error("Could not update follow status.");
            if (context.previousFollowers) {
                queryClient.setQueryData(["userFollowers"], context.previousFollowers);
            }
            if (context.previousFollowing) {
                queryClient.setQueryData(["userFollowing"], context.previousFollowing);
            }
        },
        // Always refetch after error or success to ensure server state
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            queryClient.invalidateQueries({ queryKey: ["userFollowers"] });
            queryClient.invalidateQueries({ queryKey: ["userFollowing"] });
            queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
        },
    });

    return { follow, isPending };
};

export default useFollow;