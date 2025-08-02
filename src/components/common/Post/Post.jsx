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
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import LoadingSpinner from "../LoadingSpinner.jsx";
import { timeAgo } from "../../../utils/timeAgo.js";
import { backendServer } from "../../../BackendServer.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";
import useComment from "../../../custom_hooks/useComment";
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
	const navigate = useNavigate(); // Initialize useNavigate
	const editImageInputRef = useRef(null);

	const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
	const [likeCount, setLikeCount] = useState(post.likeCount);

	const postOwner = {
		username: post.authorUsername,
		uuid: post.authorUuid,
		profileImg: post.authorProfilePictureUrl || "/avatar-placeholder.png",
	};

	const formattedDate = timeAgo(post.createdAt);
	const isMyPost = authUser?.uuid === post.authorUuid;
	const isBookmarked = authUser?.bookmarks?.includes(post.postUuid);

	//  Mutations (TanStack Query)

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

	const { mutate: updatePost, isPending: isUpdating } = useMutation({
		mutationFn: async (updateData) => {
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(updateData),
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

	const { commentPost, isCommenting } = useComment();

	// Event Handlers

	const handleLikePost = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevent navigation when liking
		!isLiking && likePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevent navigation

		if (isCommenting || !comment.trim()) return;

		commentPost({ parentPostUuid: post.postUuid, content: comment });
		setComment("");
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const remainingSlots = maxImages - editImages.length;
		if (remainingSlots <= 0) return;

		const filesToAdd = files.slice(0, remainingSlots);

		// Process each file
		filesToAdd.forEach((file) => {
			if (file) {
				const reader = new FileReader();

				// This runs when the file is successfully read
				reader.onload = () => {
					// Add the result (Base64 string) to the state array
					setEditImages((prevImages) => [...prevImages, reader.result]);
				};

				// This starts the reading process
				reader.readAsDataURL(file);
			}
		});
	};

	const removeImage = (indexToRemove) => {
		setEditImages((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	const handleUpdatePost = (e) => {
		e.preventDefault();

		// Filter images: separate old URLs from new Base64 strings.
		// New images will be strings that start with "data:image/..."
		const existingImageUrls = editImages.filter((img) =>
			img.startsWith("http")
		);
		const newImagesAsBase64 = editImages.filter((img) =>
			img.startsWith("data:")
		);

		// JSON payload to send to the backend
		const payload = {
			content: editContent,
			existingImages: existingImageUrls,
			newImages: newImagesAsBase64,
		};

		updatePost(payload);
	};

	return (
		<div
			className="overflow-y-hidden no-scrollbar pr-4 cursor-pointer"
			onClick={() => navigate(`/post/${post.postUuid}`)} // Add onClick handler
		>
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<div className="w-8 rounded-full">
						<Link
							to={`/profile/${postOwner?.username}`}
							onClick={(e) => e.stopPropagation()} // Prevent parent onClick
						>
							<img src={postOwner?.profileImg || "/avatar-placeholder.png"} />
						</Link>
					</div>
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
			/>
		</div>
	);
};
export default Post;
