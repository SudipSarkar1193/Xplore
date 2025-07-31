// src/components/common/Post.jsx

import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { timeAgo } from "../../utils/timeAgo.js";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx";

const Post = ({ post, feedType }) => {
	// Pass down feedType
	const [comment, setComment] = useState("");
	const { authUser, authToken } = useAuthContext();
	const queryClient = useQueryClient();

	// The backend doesn't send an array of likes, only the count.
	// We need to manage the "liked" state locally in the component.
	// A future backend improvement would be to send an `isLikedByCurrentUser` boolean.
	const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false); // Placeholder for now
	const [likeCount, setLikeCount] = useState(post.likeCount);

	const postOwner = {
		username: post.authorUsername,
		uuid: post.authorUuid,
		profileImg: post.authorProfileImg || "/avatar-placeholder.png", // Use placeholder if not available
	};

	const formattedDate = timeAgo(post.createdAt);
	const isMyPost = authUser?.uuid === post.authorUuid;
	const isBookmarked = authUser?.bookmarks?.includes(post.postUuid); // Placeholder

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(
				`${backendServer}/api/posts/${post.postUuid}/like`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${authToken}` },
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to like post");
			return data;
		},
		// We use onMutate for a true optimistic update (UI changes instantly)
		onMutate: async () => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: ["posts", feedType] });

			// Snapshot the previous state
			const previousPosts = queryClient.getQueryData(["posts", feedType]);

			// Optimistically update to the new value
			setIsLiked(!isLiked);
			setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

			// Return a context object with the snapshot value
			return { previousPosts };
		},
		// If the mutation fails, use the context we returned to roll back
		onError: (err, variables, context) => {
			queryClient.setQueryData(["posts", feedType], context.previousPosts);
			setIsLiked(!isLiked); // Revert state
			setLikeCount(isLiked ? likeCount + 1 : likeCount - 1); // Revert count
			toast.error(err.message);
		},
		// Finally, always refetch after the mutation is settled (success or error)
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
		},
	});

	const { mutate: deletePost, isPending: isPendingDelete } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${authToken}` },
			});
			if (!res.ok) {
				const errorData = await res
					.json()
					.catch(() => ({ message: "Failed to delete post" }));
				throw new Error(errorData.message);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(
				`${backendServer}/api/posts/${post.postUuid}/comments`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify({ content: comment }),
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to comment");
			return data;
		},
		onSuccess: () => {
			toast.success("Comment posted successfully");
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
		},
		onError: (error) => toast.error(error.message),
	});

	const handleLikePost = () => !isLiking && likePost();
	const handleDeletePost = () => deletePost();
	const handlePostComment = (e) => {
		e.preventDefault();
		!isCommenting && commentPost();
	};

	return (
		<div className="overflow-y-hidden no-scrollbar pr-4">
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<Link
						to={`/profile/${postOwner.username}`}
						className="w-8 rounded-full overflow-hidden"
					>
						<img src={postOwner.profileImg} />
					</Link>
				</div>
				<div className="flex flex-col flex-1">
					<div className="flex gap-2 items-center">
						<Link to={`/profile/${postOwner.username}`} className="font-bold">
							{postOwner.username}
						</Link>
						<span className="text-gray-700 flex gap-1 text-sm">
							<Link to={`/profile/${postOwner.username}`}>
								@{postOwner.username}
							</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className="flex justify-end flex-1">
								{isPendingDelete ? (
									<LoadingSpinner size="sm" />
								) : (
									<FaTrash
										className="cursor-pointer hover:text-red-500"
										onClick={() =>
											document
												.getElementById(`delete_modal_${post.postUuid}`)
												.showModal()
										}
									/>
								)}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-3 overflow-hidden">
						<span className="preformatted open-sans-medium text-ellipsis">
							{post.content}
						</span>
						{post.imageUrls && post.imageUrls[0] && (
							<img
								src={post.imageUrls[0]}
								className="h-80 object-contain rounded-lg border border-gray-700"
								alt=""
							/>
						)}
					</div>
					<div className="flex justify-between mt-3">
						<div className="flex gap-4 items-center w-2/3 justify-between">
							<div
								className="flex gap-1 items-center cursor-pointer group"
								onClick={() =>
									document
										.getElementById(`comments_modal_${post.postUuid}`)
										.showModal()
								}
							>
								<FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
								<span className="text-sm text-slate-500 group-hover:text-sky-400">
									{post.commentCount}
								</span>
							</div>
							<div
								className="flex gap-1 items-center group cursor-pointer"
								onClick={handleLikePost}
							>
								{isLiking ? (
									<LoadingSpinner size="sm" />
								) : isLiked ? (
									<FaHeart className="w-4 h-4 text-pink-600" />
								) : (
									<FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
								)}
								<span
									className={`text-sm ${
										isLiked ? "text-pink-600" : "text-slate-500"
									} group-hover:text-pink-500`}
								>
									{likeCount}
								</span>
							</div>
						</div>
						<div className="flex w-1/3 justify-end gap-2 items-center">
							{isBookmarked ? (
								<FaBookmark className="w-4 h-4 text-lime-600" />
							) : (
								<FaRegBookmark className="w-4 h-4 text-slate-500" />
							)}
						</div>
					</div>
				</div>

				{/* Delete Modal */}
				<dialog id={`delete_modal_${post.postUuid}`} className="modal">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Confirm Deletion</h3>
						<p className="py-4">Are you sure you want to delete this post?</p>
						<div className="modal-action">
							<button className="btn btn-error" onClick={handleDeletePost}>
								Delete
							</button>
							<form method="dialog">
								<button className="btn">Cancel</button>
							</form>
						</div>
					</div>
				</dialog>

				{/* Comments Modal */}
				<dialog id={`comments_modal_${post.postUuid}`} className="modal">
					<div className="modal-box">
						<h3 className="font-bold text-lg mb-4">COMMENTS</h3>
						<div className="flex flex-col gap-3 max-h-60 overflow-auto">
							{post.comments?.length === 0 && (
								<p className="text-sm text-slate-500">No comments yet.</p>
							)}
							{post.comments?.map((comment) => (
								<div key={comment.postUuid} className="flex gap-2 items-start">
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img
												src={
													comment.authorProfileImg || "/avatar-placeholder.png"
												}
											/>
										</div>
									</div>
									<div className="flex flex-col">
										<div className="flex items-center gap-1">
											<span className="font-bold">
												{comment.authorUsername}
											</span>
											<span className="text-gray-700 text-sm">
												@{comment.authorUsername}
											</span>
										</div>
										<div className="text-sm">
											<pre className="preformatted open-sans-medium">
												{comment.content}
											</pre>
										</div>
									</div>
								</div>
							))}
						</div>
						<form
							className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
							onSubmit={handlePostComment}
						>
							<textarea
								className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
								placeholder="Add a comment..."
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
							<button className="btn btn-primary rounded-full btn-sm text-white px-4">
								{isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
							</button>
						</form>
					</div>
					<form method="dialog" className="modal-backdrop">
						<button className="outline-none">close</button>
					</form>
				</dialog>
			</div>
		</div>
	);
};
export default Post;
