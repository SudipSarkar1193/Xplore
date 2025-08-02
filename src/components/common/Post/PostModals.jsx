import { FaTimes, FaPlus } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner.jsx";
import Comment from "./Comment.jsx";
import CreatePost from "../../../pages/home/CreatePost.jsx";
const PostModals = ({
	post,
	editContent,
	setEditContent,
	editImages,
	handleUpdatePost,
	isUpdating,
	handleImageChange,
	removeImage,
	editImageInputRef,
	maxImages,
	deletePost,
	
}) => {
	return (
		<>
			{/* Edit Modal */}
			<dialog id={`edit_modal_${post.postUuid}`} className="modal">
				<div className="modal-box max-w-2xl">
					<h3 className="font-bold text-lg mb-4">Edit Post</h3>
					<form onSubmit={handleUpdatePost}>
						<div className="form-control mb-4">
							<textarea
								className="textarea textarea-bordered w-full h-24 resize-none"
								placeholder="What's on your mind?"
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
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
											src={
												typeof image === "string"
													? image
													: URL.createObjectURL(image)
											}
											className="w-full h-32 object-cover rounded border"
											alt={`Edit preview ${index + 1}`}
										/>
										<button
											type="button"
											className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
											onClick={() => removeImage(index)}
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
							>
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
						<button className="btn btn-error" onClick={() => deletePost()}>
							Delete
						</button>
						<form method="dialog">
							<button className="btn">Cancel</button>
						</form>
					</div>
				</div>
			</dialog>

			
		</>
	);
};

export default PostModals;
