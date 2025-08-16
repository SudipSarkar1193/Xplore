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
		onMutate: async (postUuid) => {
			console.log("🔍 Optimistic update for postUuid:", postUuid);
			
			// Canceling any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			await queryClient.cancelQueries({ queryKey: ["post"] });

			// Taking a snapshot of the previous values for rollback
			const previousPostsData = queryClient.getQueriesData({ queryKey: ["posts"] });
			const previousPostData = queryClient.getQueriesData({ queryKey: ["post"] });

			console.log("📊 Previous post data:", previousPostData);

			// Helper function to update a single post
			const updatePostInData = (post) => {
				if (post.postUuid === postUuid) {
					const updated = {
						...post,
						likedByCurrentUser: !post.likedByCurrentUser,
						likeCount: post.likedByCurrentUser 
							? post.likeCount - 1 
							: post.likeCount + 1
					};
					console.log("✅ Updated post:", { 
						uuid: postUuid, 
						oldLiked: post.likedByCurrentUser, 
						newLiked: updated.likedByCurrentUser,
						oldCount: post.likeCount,
						newCount: updated.likeCount
					});
					return updated;
				}
				return post;
			};

			// Helper function to recursively update posts in nested structures
			const updatePostsRecursively = (data, depth = 0) => {
				const indent = "  ".repeat(depth);
				console.log(`${indent}🔄 Processing data at depth ${depth}:`, typeof data, Array.isArray(data) ? `Array(${data.length})` : typeof data === 'object' ? Object.keys(data) : data);
				
				if (!data) return data;
				
				// Handling arrays (like posts feeds, comments arrays)
				if (Array.isArray(data)) {
					return data.map(item => updatePostsRecursively(item, depth + 1));
				}

				// Handling objects
				if (typeof data === 'object') {
					let updated = { ...data };
					let hasChanges = false;
					
					// Check if this is a post object and update it
					if (data.postUuid) {
						console.log(`${indent}📝 Found post with UUID: ${data.postUuid}`);
						const updatedPost = updatePostInData(data);
						if (updatedPost !== data) {
							updated = updatedPost;
							hasChanges = true;
							console.log(`${indent}✨ Post updated!`);
						}
					}
					
					// Recursively checking all properties that might contain posts
					for (const key in data) {
						if (data[key] && typeof data[key] === 'object') {
							const updatedValue = updatePostsRecursively(data[key], depth + 1);
							if (updatedValue !== data[key]) {
								updated[key] = updatedValue;
								hasChanges = true;
								console.log(`${indent}🔄 Updated property: ${key}`);
							}
						}
					}
					
					return hasChanges ? updated : data;
				}
				
				return data;
			};

			// Optimistically updating posts queries (homepage, profile feeds, etc.)
			previousPostsData.forEach(([queryKey, data]) => {
				if (data) {
					console.log("🏠 Updating posts query:", queryKey);
					const updated = updatePostsRecursively(data);
					queryClient.setQueryData(queryKey, updated);
				}
			});

			// Optimistically updating individual post queries (post details page)
			previousPostData.forEach(([queryKey, data]) => {
				if (data) {
					console.log("📄 Updating individual post query:", queryKey);
					const updated = updatePostsRecursively(data);
					queryClient.setQueryData(queryKey, updated);
				}
			});

			// Return context for rollback
			return { previousPostsData, previousPostData };
		},
		onError: (err, postUuid, context) => {
			console.error("❌ Like operation failed, rolling back:", err.message);
			// Rollback on error
			if (context?.previousPostsData) {
				context.previousPostsData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
			if (context?.previousPostData) {
				context.previousPostData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
			toast.error(err.message);
		},
		onSuccess: (data, postUuid) => {
			console.log("✅ Like operation succeeded for:", postUuid, data);
		},
	});

	return { likePost, isLiking };
};
export default useLikePost;