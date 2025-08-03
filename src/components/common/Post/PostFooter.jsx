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
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["post", post.postUuid] });

            // Snapshot the previous value
            const previousPost = queryClient.getQueryData(["post", post.postUuid]);
            const previousPosts = queryClient.getQueryData(["posts"]);

            // Optimistically update to the new value
            if (previousPost) {
                queryClient.setQueryData(["post", post.postUuid], {
                    ...previousPost,
                    shareCount: previousPost.shareCount + 1,
                });
            }

            if (previousPosts) {
                const updatedPosts = previousPosts.map(p =>
                    p.postUuid === post.postUuid
                        ? { ...p, shareCount: p.shareCount + 1 }
                        : p
                );
                queryClient.setQueryData(["posts"], updatedPosts);
            }

            // Return a context object with the snapshotted value
            return { previousPost, previousPosts };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newPost, context) => {
            if (context.previousPost) {
                queryClient.setQueryData(["post", post.postUuid], context.previousPost);
            }
            if (context.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }
            console.error("Failed to increment the count share ");
        },
        // Always refetch after error or success to ensure data consistency
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["post", post.postUuid] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

	const sharePost = async (e) => {
		e.stopPropagation(); // Prevent triggering the post click event
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

				// You could show a toast notification here
				toast.success("Link copied to clipboard!");
			}

			console.log("calling incrementShareCount()");
			// Increment share count in the backend
			incrementShareCount();
		} catch (error) {
			console.error("Error sharing post:", error);
		}
	};

	return (
		<div className="">
			{showInfo && (
				<div className="flex justify-between items-center h-10">
					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-slate-200 hover:text-sky-300 no-underline hover:underline transition-colors duration-200">
							{post.commentCount} comments
						</span>
					</div>

					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-slate-200 hover:text-sky-300 no-underline hover:underline transition-colors duration-200">
							{post.likeCount} likes
						</span>
					</div>

					<div className="flex gap-1 items-center cursor-pointer group transition-colors duration-200">
						<span className="text-lg text-pretty text-slate-200 hover:text-sky-300 no-underline hover:underline transition-colors duration-200">
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
