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
				const errorData = await res.json().catch(() => ({ message: "Failed to delete post" }));
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
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}/like`, {
				method: "POST",
				headers: { Authorization: `Bearer ${authToken}` },
			});
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
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ content: comment }),
			});
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
	}
	
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

		const existingImageUrls = editImages.filter((img) => typeof img === "string");
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

	//Render function for images

	const renderImageGallery = () => {
		if (!post.imageUrls || post.imageUrls.length === 0) return null;
		const count = post.imageUrls.length;

		if (count === 1) {
			return <img src={post.imageUrls[0]} className="w-full h-80 object-cover rounded-lg border border-gray-700" alt="Post image" />;
		}
		if (count === 2) {
			return (
				<div className="grid grid-cols-2 gap-2">
					{post.imageUrls.map((url, index) => (
						<img key={index} src={url} className="w-full h-60 object-cover rounded-lg border border-gray-700" alt={`Post image ${index + 1}`} />
					))}
				</div>
			);
		}
		if (count === 3) {
			return (
				<div className="grid grid-cols-2 gap-2 h-64">
					<img src={post.imageUrls[0]} className="row-span-2 h-full w-full object-cover rounded-lg border border-gray-700" alt="Post image 1"/>
					<img src={post.imageUrls[1]} className="h-full w-full object-cover rounded-lg border border-gray-700" alt="Post image 2"/>
					<img src={post.imageUrls[2]} className="h-full w-full object-cover rounded-lg border border-gray-700" alt="Post image 3"/>
				</div>
			);
		}
		// Layout for 4 or more images
		return (
			<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
				{post.imageUrls.slice(0, 3).map((url, index) => (
					<img key={index} src={url} className={`${index === 0 ? "row-span-2" : ""} h-full w-full object-cover rounded-lg border border-gray-700`} alt={`Post image ${index + 1}`}/>
				))}
				<div className="relative h-full w-full">
					<img src={post.imageUrls[3]} className="h-full w-full object-cover rounded-lg border border-gray-700" alt="Post image 4"/>
					{count > 4 && (
						<div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
							<span className="text-white text-xl font-bold">+{count - 4}</span>
						</div>
					)}
				</div>
			</div>
		);
	};
	
	return (
		<div className="overflow-y-hidden no-scrollbar pr-4">
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<Link to={`/profile/${postOwner.username}`} className="w-8 rounded-full overflow-hidden">
						<img src={postOwner.profileImg} />
					</Link>
				</div>
				<div className="flex flex-col flex-1">
					<div className="flex gap-2 items-center">
						<Link to={`/profile/${postOwner.username}`} className="font-bold">
							{postOwner.username}
						</Link>
						<span className="text-gray-700 flex gap-1 text-sm">
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className="flex justify-end flex-1 gap-2">
								{isPendingDelete ? (<LoadingSpinner size="sm" />) : (
									<>
										<FaEdit className="cursor-pointer hover:text-blue-500" onClick={() => document.getElementById(`edit_modal_${post.postUuid}`).showModal()}/>
										<FaTrash className="cursor-pointer hover:text-red-500" onClick={() => document.getElementById(`delete_modal_${post.postUuid}`).showModal()}/>
									</>
								)}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-3 overflow-hidden">
						<p className="whitespace-pre-wrap open-sans-medium">{post.content}</p>
						{renderImageGallery()}
					</div>
					<div className="flex justify-between mt-3">
						<div className="flex gap-4 items-center w-2/3 justify-between">
							<div className="flex gap-1 items-center cursor-pointer group" onClick={() => document.getElementById(`comments_modal_${post.postUuid}`).showModal()}>
								<FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
								<span className="text-sm text-slate-500 group-hover:text-sky-400">
									{post.commentCount}
								</span>
							</div>
							<div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
								{isLiking ? (<LoadingSpinner size="sm" />) : isLiked ? (
									<FaHeart className="w-4 h-4 text-pink-600" />
								) : (
									<FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
								)}
								<span className={`text-sm ${isLiked ? "text-pink-600" : "text-slate-500"} group-hover:text-pink-500`}>
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

				{/* Edit Modal */}
				<dialog id={`edit_modal_${post.postUuid}`} className="modal">
					<div className="modal-box max-w-2xl">
						<h3 className="font-bold text-lg mb-4">Edit Post</h3>
						<form onSubmit={handleUpdatePost}>
							<div className="form-control mb-4">
								<textarea className="textarea textarea-bordered w-full h-24 resize-none" placeholder="What's on your mind?" value={editContent} onChange={(e) => setEditContent(e.target.value)}/>
							</div>

							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">Images</span>
								</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
									{editImages.map((image, index) => (
										<div key={index} className="relative">
											<img src={typeof image === "string" ? image : URL.createObjectURL(image)} className="w-full h-32 object-cover rounded border" alt={`Edit preview ${index + 1}`}/>
											<button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600" onClick={() => removeImage(index)}>
												<FaTimes />
											</button>
										</div>
									))}
									{editImages.length < maxImages && (
										<label className="w-full h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:border-gray-600">
											<input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} ref={editImageInputRef}/>
											<FaPlus className="text-gray-400 text-2xl" />
										</label>
									)}
								</div>
							</div>
							<div className="modal-action">
								<button type="submit" className="btn btn-primary" disabled={isUpdating}>
									{isUpdating ? <LoadingSpinner size="sm" /> : "Update Post"}
								</button>
								<form method="dialog">
									<button className="btn">Cancel</button>
								</form>
							</div>
						</form>
					</div>
				</dialog>

				{/* Delete Modal */}
				<dialog id={`delete_modal_${post.postUuid}`} className="modal">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Confirm Deletion</h3>
						<p className="py-4">Are you sure you want to delete this post?</p>
						<div className="modal-action">
							<button className="btn btn-error" onClick={() => deletePost()}>Delete</button>
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
							{post.comments?.length === 0 && (<p className="text-sm text-slate-500">No comments yet.</p>)}
							{post.comments?.map((c) => (
								<div key={c.uuid} className="flex gap-2 items-start"> 
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img src={c.authorProfileImg || "/avatar-placeholder.png"}/>
										</div>
									</div>
									<div className="flex flex-col">
										<div className="flex items-center gap-1">
											<span className="font-bold">{c.authorUsername}</span>
											<span className="text-gray-700 text-sm">@{c.authorUsername}</span>
										</div>
										<div className="text-sm">
											<pre className="whitespace-pre-wrap open-sans-medium">{c.content}</pre>
										</div>
									</div>
								</div>
							))}
						</div>
						<form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2" onSubmit={handlePostComment}>
							<textarea className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)}/>
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