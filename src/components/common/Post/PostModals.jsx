import { useState, useRef, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../../../BackendServer";
import { useAuthContext } from "../../../context/AuthContext";

const PostModals = ({ post, maxImages = 4, parentPostUuid }) => {
	const [editContent, setEditContent] = useState("");
	const [editImages, setEditImages] = useState([]);
	const editImageInputRef = useRef(null);
	const { authToken, authUser } = useAuthContext();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (post) {
			setEditContent(post.content);
			setEditImages(post.imageUrls || []);
		}
	}, [post]);

	const { mutate: updatePost, isPending: isUpdating } = useMutation({
		mutationFn: async (rawUpdateData) => {
			const updateData = { ...rawUpdateData, authorUUid: authUser.uuid };
			if (
				!updateData.content &&
				updateData.existingImages.length === 0 &&
				updateData.newImages.length === 0
			) {
				throw new Error("Post must have content or images");
			}
			const res = await fetch(`${backendServer}/api/posts/${post.postUuid}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(updateData),
			});

			
			if (!res.ok) throw new Error(data.message || "Failed to update post");

			const data = await res.json();
			;
			return data;
		},
		onSuccess: () => {
			toast.success("Post updated successfully!");
			if (parentPostUuid) {
				// It's a comment, so invalidate the PARENT post's query to refetch comments
				queryClient.invalidateQueries({ queryKey: ["post", parentPostUuid] });
			} else {
				// It's a top-level post, invalidate the general feed
				queryClient.invalidateQueries({ queryKey: ["posts"] });
			}

			// Also invalidate the query for the individual post/comment itself
			queryClient.invalidateQueries({ queryKey: ["post", post.postUuid] });
			
			document.getElementById(`edit_modal_${post.postUuid}`).close();
		},
		onError: (error) => {
			console.error(error);

			toast.error(error.message);
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
			if (parentPostUuid) {
				// If it's a comment, invalidate the parent post's query
				queryClient.invalidateQueries({ queryKey: ["post", parentPostUuid] });
			} else {
				// If it's a top-level post, invalidate the general posts list
				queryClient.invalidateQueries({ queryKey: ["posts"] });
			}

			queryClient.invalidateQueries({ queryKey: ["post", post.postUuid] });

			document.getElementById(`delete_modal_${post.postUuid}`).close();
		},
		onError: (error) => {
			console.error(error);

			toast.error(error.message);
		},
	});

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const remainingSlots = maxImages - editImages.length;
		if (remainingSlots <= 0) return;

		const filesToAdd = files.slice(0, remainingSlots);

		filesToAdd.forEach((file) => {
			if (file) {
				const reader = new FileReader();
				reader.onload = () => {
					setEditImages((prevImages) => [...prevImages, reader.result]);
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const removeImage = (indexToRemove) => {
		setEditImages((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	const handleUpdatePost = (e) => {
		e.preventDefault();
		const existingImageUrls = editImages.filter((img) =>
			img.startsWith("http")
		);
		const newImagesAsBase64 = editImages.filter((img) =>
			img.startsWith("data:")
		);
		const payload = {
			content: editContent,
			existingImages: existingImageUrls,
			newImages: newImagesAsBase64,
		};
		updatePost(payload);
	};

	const stopPropagation = (e) => e.stopPropagation();

	return (
		<>
			<dialog
				id={`edit_modal_${post.postUuid}`}
				className="modal"
				onClick={stopPropagation}
			>
				<div className="modal-box max-w-2xl">
					<h3 className="font-bold text-lg mb-4">Edit Post</h3>
					<form onSubmit={handleUpdatePost}>
						<div className="form-control mb-4">
							<textarea
								className="textarea textarea-bordered w-full h-24 resize-none"
								placeholder="What's on your mind?"
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								onClick={stopPropagation}
							/>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Images</span>
							</label>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
								{editImages.map((image, index) => (
									<div key={index} className="relative">
										<img
											src={image}
											className="w-full h-32 object-cover rounded border"
											alt={`Edit preview ${index + 1}`}
										/>
										<button
											type="button"
											className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
											onClick={(e) => {
												stopPropagation(e);
												removeImage(index);
											}}
										>
											<FaTimes />
										</button>
									</div>
								))}
								{editImages.length < maxImages && (
									<label className="w-full h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:border-gray-600">
										<input
											type="file"
											multiple
											accept="image/*"
											className="hidden"
											onChange={handleImageChange}
											ref={editImageInputRef}
										/>
										<FaPlus className="text-gray-400 text-2xl" />
									</label>
								)}
							</div>
						</div>
						<div className="modal-action">
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isUpdating}
								onClick={stopPropagation}
							>
								{isUpdating ? <LoadingSpinner size="sm" /> : "Update Post"}
							</button>
							<form method="dialog" onSubmit={stopPropagation}>
								<button className="btn" onClick={stopPropagation}>
									Cancel
								</button>
							</form>
						</div>
					</form>
				</div>
			</dialog>

			<dialog
				id={`delete_modal_${post.postUuid}`}
				className="modal"
				onClick={stopPropagation}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">Confirm Deletion</h3>
					<p className="py-4">Are you sure you want to delete this post?</p>
					<div className="modal-action">
						<button
							className="btn btn-error"
							onClick={(e) => {
								e.preventDefault();
								stopPropagation(e);
								deletePost();
							}}
						>
							{isPendingDelete ? <LoadingSpinner size="sm" /> : "Delete"}
						</button>
						<form method="dialog" onSubmit={stopPropagation}>
							<button className="btn" onClick={stopPropagation}>
								Cancel
							</button>
						</form>
					</div>
				</div>
			</dialog>
		</>
	);
};

export default PostModals;
