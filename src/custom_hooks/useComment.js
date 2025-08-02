import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useComment = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async ({ parentPostUuid, content }) => {
			try {
				const res = await fetch(
					`${backendServer}/api/posts/${parentPostUuid}/comments`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
						body: JSON.stringify({ content }),
					}
				);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Failed to post comment");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Comment posted successfully!");
			// Invalidate all queries starting with 'posts' to refresh the feed
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
            console.log("Error posting comment:", error);
            toast.error(error.message || "Failed to post comment");
			toast.error(error.message);
		},
	});

	return { commentPost, isCommenting };
};

export default useComment;