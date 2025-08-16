import {
	FaRegComment,
	FaHeart,
	FaRegHeart,
	FaBookmark,
	FaRegBookmark,
	FaShare,
} from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { backendServer } from "../../../BackendServer";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../context/AuthContext";
const PostFooter = ({
	post,
	isLiking,
	isLiked,
	likeCount,
	isBookmarked,
	handleLikePost,
	showInfo,
}) => {
	const queryClient = useQueryClient();
	const { authToken } = useAuthContext();

	console.log("showInfo", showInfo);

	const { mutate: incrementShareCount, isPending: isIncreasingShareCount } =
		useMutation({
			mutationFn: async () => {
				const res = await fetch(
					`${backendServer}/api/posts/${post.postUuid}/increase-share-count`,
					{
						method: "put",
						headers: { Authorization: `Bearer ${authToken}` },
					}
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Failed to share post");
				return data;
			},
			onMutate: async () => {
				// Canceling any outgoing refetches so they don't overwrite our optimistic update
				await queryClient.cancelQueries({ queryKey: ["posts"] });
				await queryClient.cancelQueries({ queryKey: ["post"] });

				// Taking a snapshot of the previous values for rollback
				const previousPostsData = queryClient.getQueriesData({
					queryKey: ["posts"],
				});
				const previousPostData = queryClient.getQueriesData({
					queryKey: ["post"],
				});

				// Helper function to update a single post's share count
				const updatePostShareCount = (postData) => {
					if (postData.postUuid === post.postUuid) {
						return {
							...postData,
							shareCount: postData.shareCount + 1,
						};
					}
					return postData;
				};

				// Helper function to recursively update posts in nested structures
				const updatePostsRecursively = (data) => {
					if (!data) return data;

					// Handling arrays (like posts feeds, comments arrays)
					if (Array.isArray(data)) {
						return data.map(updatePostsRecursively);
					}

					// Handling objects
					if (typeof data === "object") {
						let updated = { ...data };
						let hasChanges = false;

						// if this is a post object -> update it
						if (data.postUuid) {
							const updatedPost = updatePostShareCount(data);
							if (updatedPost !== data) {
								updated = updatedPost;
								hasChanges = true;
							}
						}

						// Recursively check all properties that might contain posts
						for (const key in data) {
							if (data[key] && typeof data[key] === "object") {
								const updatedValue = updatePostsRecursively(data[key]);
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

				// Optimistically update posts queries (homepage, profile feeds, etc.)
				previousPostsData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, updatePostsRecursively(data));
					}
				});

				// Optimistically update individual post queries (post details page)
				previousPostData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, updatePostsRecursively(data));
					}
				});

				// Return context for rollback
				return { previousPostsData, previousPostData };
			},
			onError: (err, variables, context) => {
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
				console.error("Failed to increment the share count:", err.message);
				toast.error("Failed to share post");
			},
			onSuccess: () => {
				console.log("Share count incremented successfully!");
			},
		});

	const sharePost = async (e) => {
		e.preventDefault();
		e.stopPropagation(); 
		try {
			// Check if Web Share API is supported
			if (navigator.share) {
				await navigator.share({
					title: `Check out this post`,
					text:
						post.content?.substring(0, 100) + "..." ||
						"Interesting post to share!",
					url: `${window.location.origin}/post/${post.postUuid}`,
				});
			} else {
				// Fallback: Copy to clipboard
				const postUrl = `${window.location.origin}/post/${post.postUuid}`;
				await navigator.clipboard.writeText(postUrl);

				// toasting a notification
				toast.success("Link copied to clipboard!");
			}

			console.log("calling incrementShareCount()");
			// Increment shareCount in the backend
			incrementShareCount(); 
		} catch (error) {
			console.error("Error sharing post:", error);
		}
	};

	return (
		<div className="">
			{showInfo && (
				<div className="flex justify-between items-center h-10  ">
					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-orange-500 hover:text-orange-700 no-underline hover:underline transition-colors duration-200">
							{post.commentCount} comments
						</span>
					</div>

					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-white hover:text-sky-300 no-underline hover:underline transition-colors duration-200">
							{post.likeCount} likes
						</span>
					</div>

					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-green-500  hover:text-green-700 no-underline hover:underline transition-colors duration-200">
							{post.shareCount} shares
						</span>
					</div>
				</div>
			)}
			<div className="flex justify-between items-center h-10">
				{/* Comment Button */}
				<div
					className="flex gap-1 items-center cursor-pointer group transition-colors duration-200"
					onClick={() =>
						document
							.getElementById(`comments_modal_${post.postUuid}`)
							.showModal()
					}
				>
					<FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors duration-200" />
					{!showInfo && (
						<span className="text-sm text-slate-500 group-hover:text-sky-400 transition-colors duration-200">
							{post.commentCount}
						</span>
					)}
				</div>

				{/* Like Button */}
				<div
					className="flex gap-1 items-center group cursor-pointer transition-colors duration-200"
					onClick={handleLikePost}
				>
					{isLiking ? (
						<LoadingSpinner size="sm" />
					) : isLiked ? (
						<FaHeart className="w-4 h-4 text-pink-600" />
					) : (
						<FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500 transition-colors duration-200" />
					)}
					{!showInfo && (
						<span
							className={`text-sm transition-colors duration-200 ${
								isLiked
									? "text-pink-600"
									: "text-slate-500 group-hover:text-pink-500"
							}`}
						>
							{likeCount}
						</span>
					)}
				</div>

				{/* Share Button */}
				<div
					className="flex gap-1 items-center group cursor-pointer transition-colors duration-200"
					onClick={sharePost}
				>
					<FaShare className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 transition-colors duration-200" />
					{!showInfo && (
						<span className="text-sm text-slate-500 group-hover:text-emerald-500 transition-colors duration-200">
							{post.shareCount}
						</span>
					)}
				</div>

				{/* Bookmark Button */}
				<div className="flex items-center">
					<div
						className="cursor-pointer group transition-all duration-200 hover:scale-110"
						onClick={(e) => {
							e.stopPropagation();
							toast.custom("Comming soon");
						}}
					>
						{isBookmarked ? (
							<FaBookmark className="w-4 h-4 text-amber-500" />
						) : (
							<FaRegBookmark className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors duration-200" />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PostFooter;
