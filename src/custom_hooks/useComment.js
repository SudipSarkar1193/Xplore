import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useComment = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async ({ parentPostUuid, formData }) => {
			try {
				// ✅ Extract content from "commentRequest"
				let content = "";
				const contentBlob = formData.get("commentRequest");
				if (contentBlob) {
					const textData = await contentBlob.text();
					try {
						const parsed = JSON.parse(textData);
						content = parsed.content || "";
					} catch (error) {
						console.error("Failed to parse commentRequest JSON:", error);
					}
				}

				if (
					(!content || content.trim() === "") &&
					(formData.get("images") == null || !formData.get("images").size)
				) {
					throw new Error("Comment cannot be empty");
				}

				const res = await fetch(
					`${backendServer}/api/posts/${parentPostUuid}/comments`,
					{
						method: "POST",
						headers: {
							// Content-Type is not set, browser handles it for FormData
							Authorization: `Bearer ${authToken}`,
						},
						body: formData,
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
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post"] });
		},
		onError: (error) => {
			console.log("Error posting comment:", error);
			toast.error(error.message || "Failed to post comment");
			throw error; // Re-throw the error
		},
	});

	return { commentPost, isCommenting };
};

export default useComment;
