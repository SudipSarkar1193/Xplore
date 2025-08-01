import { FaTimes, FaPlus } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner.jsx";
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
	comment,
	setComment,
	handlePostComment,
	isCommenting,
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

			{/* Comments Modal */}
			<dialog id={`comments_modal_${post.postUuid}`} className="modal">
				<div className="modal-box">
					<h3 className="font-bold text-lg mb-4">COMMENTS</h3>
					<div className="flex flex-col gap-3 max-h-60 overflow-auto">
						{post.comments?.length === 0 && (
							<p className="text-sm text-slate-500">No comments yet.</p>
						)}
						{post.comments?.map((c) => (
							<div key={c.uuid} className="flex gap-2 items-start">
								<div className="avatar">
									<div className="w-8 rounded-full">
										<img
											src={c.authorProfileImg || "/avatar-placeholder.png"}
										/>
									</div>
								</div>
								<div className="flex flex-col">
									<div className="flex items-center gap-1">
										<span className="font-bold">{c.authorUsername}</span>
										<span className="text-gray-700 text-sm">
											@{c.authorUsername}
										</span>
									</div>
									<div className="text-sm">
										<pre className="whitespace-pre-wrap open-sans-medium">
											{c.content}
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
		</>
	);
};

export default PostModals;
