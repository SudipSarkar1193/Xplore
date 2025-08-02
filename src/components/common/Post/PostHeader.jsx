import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
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
		<div className="flex gap-2 items-center">
			<Link to={`/profile/${postOwner.username}`} className="font-bold" onClick={(e) => e.stopPropagation()}>
				{postOwner.username}
			</Link>
			<span className="text-gray-700 flex gap-1 text-sm">
				<Link to={`/profile/${postOwner.username}`} onClick={(e) => e.stopPropagation()}>
					@{postOwner.username}
				</Link>
				<span>·</span>
				<span>{formattedDate}</span>
			</span>
			{isMyPost && (
				<span className="flex justify-end flex-1 gap-2">
					{isPendingDelete ? (
						<LoadingSpinner size="sm" />
					) : (
						<>
							<FaEdit
								className="cursor-pointer hover:text-blue-500"
								onClick={showEditModal}
							/>
							<FaTrash
								className="cursor-pointer hover:text-red-500"
								onClick={showDeleteModal}
							/>
						</>
					)}
				</span>
			)}
		</div>
	);
};

export default PostHeader;