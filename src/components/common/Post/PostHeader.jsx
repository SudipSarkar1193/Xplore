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
			<div className="flex items-center gap-7 flex-1">
				<Link
					to={`/profile/${postOwner.username}`}
					className="font-bold justify-self-start"
					onClick={(e) => e.stopPropagation()}
				>
					@{postOwner.username}
				</Link>
				<span className="text-gray-700 flex text-sm justify-self-end ">
					<span>{formattedDate}</span>
				</span>
			</div>
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
