import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import LoadingSpinner from "../LoadingSpinner";

const PostHeader = ({
	postOwner,
	formattedDate,
	isMyPost,
	isPendingDelete,
	postUuid,
}) => {
	const showEditModal = (e) => {
		e.stopPropagation();
		document.getElementById(`edit_modal_${postUuid}`).showModal();
	};

	const showDeleteModal = (e) => {
		e.stopPropagation();
		document.getElementById(`delete_modal_${postUuid}`).showModal();
	};

	return (
		<div className="flex  items-center w-full h-full justify-between">
			{/* Left Side: Username and Date */}
			<div className="flex justify-between items-center w-[89%] ">
				<Link
					to={`/profile/${postOwner.username}`}
					className="font-bold hover:underline text-center"
					onClick={(e) => e.stopPropagation()}
				>
					@{postOwner.username}
				</Link>
				<span className="text-gray-500 text-sm">·</span>
				<span className="text-gray-500 text-sm">{formattedDate}</span>
			</div>

			{/* Right Side: Dropdown Menu for Edit/Delete */}
			{isMyPost && (
				<div className="dropdown dropdown-end">
					<button
						tabIndex={0}
						className="btn btn-ghost btn-sm btn-circle"
						onClick={(e) => e.stopPropagation()}
						aria-label="Post options"
					>
						{isPendingDelete ? (
							<LoadingSpinner size="sm" />
						) : (
							<BsThreeDotsVertical className="w-5 h-5" />
						)}
					</button>
					<ul
						tabIndex={0}
						className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]"
					>
						<li>
							<a onClick={showEditModal}>
								<FaEdit className="mr-2" /> Edit
							</a>
						</li>
						<li>
							<a onClick={showDeleteModal} className="text-red-500">
								<FaTrash className="mr-2" /> Delete
							</a>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default PostHeader;