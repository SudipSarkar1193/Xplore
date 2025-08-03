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
				console.log("Inside incrementShareCount mutationFn");
				const res = await fetch(
					`${backendServer}/api/posts/${post.postUuid}/increase-share-count`,
					{
						method: "put",
						headers: { Authorization: `Bearer ${authToken}` },
					}
				);
				const data = await res.json();
				console.log("Response from incrementShareCount:", data);
				if (!res.ok) throw new Error(data.message || "Failed to share post");
				return data;
			},
			retry: (failureCount, error) => {
				// Don't retry if it's an Unauthorized error (401)
				if (
					error.message.trim() === "Unauthorized" ||
					error.message.trim() ===
						"Full authentication is required to access this resource"
				) {
					return false;
				}

				// Retry up to 10 times for other errors
				return failureCount < 4;
			},

			retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // 1s, 2s, 4s, 8s, 10s

			onSuccess: (data) => {
				console.log(data.message || "increased share count successfully");
				queryClient.invalidateQueries({ queryKey: ["post", post.postUuid] });
			},
			onError: (error) => {
				console.log("error.message", error.message);
				console.error(error);
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
