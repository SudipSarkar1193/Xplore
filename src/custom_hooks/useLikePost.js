import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useLikePost = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async (postUuid) => {
			const res = await fetch(`${backendServer}/api/posts/${postUuid}/like`, {
				method: "POST",
				headers: { Authorization: `Bearer ${authToken}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to like post");
			return data;
		},
		onSuccess: () => {
			// After a successful like, invalidate all post-related queries.
			// This is the most reliable way to ensure all parts of the UI update correctly.
			// It will refetch data for both feeds and individual post pages.
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { likePost, isLiking };
};

export default useLikePost;