import {
	FaRegComment,
	FaHeart,
	FaRegHeart,
	FaBookmark,
	FaRegBookmark,
	FaTrash,
	FaEdit,
	FaTimes,
	FaPlus,
} from "react-icons/fa";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import LoadingSpinner from "../LoadingSpinner.jsx";
import { timeAgo } from "../../../utils/timeAgo.js";
import { backendServer } from "../../../BackendServer.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";

import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import PostModals from "./PostModals";

const Post = ({ post, feedType, maxImages = 4 }) => {
	const [comment, setComment] = useState("");
	const [editContent, setEditContent] = useState(post.content);
	const [editImages, setEditImages] = useState(post.imageUrls || []);

	const { authUser, authToken } = useAuthContext();
	const queryClient = useQueryClient();
	const editImageInputRef = useRef(null);

	// The backend doesn't send the user's like status, so we manage it locally.
	const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
	const [likeCount, setLikeCount] = useState(post.likeCount);

	const postOwner = {
		username: post.authorUsername,
		uuid: post.authorUuid,
		profileImg: post.authorProfileImg || "/avatar-placeholder.png",
	};

	const formattedDate = timeAgo(post.createdAt);
	const isMyPost = authUser?.uuid === post.authorUuid;
	const isBookmarked = authUser?.bookmarks?.includes(post.postUuid); // Placeholder

	//  Mutations (TanStack Query)
	// =================================================================================

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
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["posts", feedType] });
			const previousState = { isLiked, likeCount };
			setIsLiked((prev) => !prev);
			setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
			return { previousState };
		},
		onError: (err, variables, context) => {
			if (context?.previousState) {
				setIsLiked(context.previousState.isLiked);
				setLikeCount(context.previousState.likeCount);
			}
			toast.error(err.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
		},
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

	const { mutate: updatePost, isPending: isUpdating } = useMutation({
		mutationFn: async (formData) => {
			console.log("Updating post with data:", formData);
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}`, {
				method: "PUT",
				headers: { Authorization: `Bearer ${authToken}` },
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to update post");
			return data;
		},
		onSuccess: () => {
			toast.success("Post updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
			document.getElementById(`edit_modal_${post.postUuid}`).close();
		},
		onError: (error) => toast.error(error.message),
	});

	// Event Handlers

	const handleLikePost = (e) => {
		e.preventDefault();
		!isLiking && likePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (!isCommenting) commentPost();
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const remainingSlots = maxImages - editImages.length;
		if (remainingSlots <= 0) return;
		const filesToAdd = files.slice(0, remainingSlots);
		setEditImages((prev) => [...prev, ...filesToAdd]);
	};

	const removeImage = (indexToRemove) => {
		setEditImages((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	const handleUpdatePost = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("content", editContent);

		const existingImageUrls = editImages.filter(
			(img) => typeof img === "string"
		);
		const newImageFiles = editImages.filter((img) => typeof img !== "string");

		newImageFiles.forEach((file) => formData.append("newImages", file));
		formData.append("existingImages", JSON.stringify(existingImageUrls));

		console.log("Submitting update with formData:", {
			content: editContent,
			newImages: newImageFiles,
			existingImages: existingImageUrls,
		});
		updatePost(formData);
	};

	return (
		<div className="overflow-y-hidden no-scrollbar pr-4">
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<Link
						to={`/profile/${postOwner.username}`}
						className="w-8 rounded-full overflow-hidden"
					>
						<img
							src={postOwner.profileImg}
							alt={`${postOwner.username}'s avatar`}
						/>
					</Link>
				</div>
				<div className="flex flex-col flex-1">
					<PostHeader
						postOwner={postOwner}
						formattedDate={formattedDate}
						isMyPost={isMyPost}
						isPendingDelete={isPendingDelete}
						postUuid={post.postUuid}
					/>
					<PostBody content={post.content} imageUrls={post.imageUrls} />
					<PostFooter
						post={post}
						isLiking={isLiking}
						isLiked={isLiked}
						likeCount={likeCount}
						isBookmarked={isBookmarked}
						handleLikePost={handleLikePost}
					/>
				</div>
			</div>
			<PostModals
				post={post}
				editContent={editContent}
				setEditContent={setEditContent}
				editImages={editImages}
				handleUpdatePost={handleUpdatePost}
				isUpdating={isUpdating}
				handleImageChange={handleImageChange}
				removeImage={removeImage}
				editImageInputRef={editImageInputRef}
				maxImages={maxImages}
				deletePost={deletePost}
				comment={comment}
				setComment={setComment}
				handlePostComment={handlePostComment}
				isCommenting={isCommenting}
			/>
		</div>
	);
};
export default Post;
