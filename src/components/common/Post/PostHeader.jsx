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
	return (
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
					{isPendingDelete ? (
						<LoadingSpinner size="sm" />
					) : (
						<>
							<FaEdit
								className="cursor-pointer hover:text-blue-500"
								onClick={() =>
									document.getElementById(`edit_modal_${postUuid}`).showModal()
								}
							/>
							<FaTrash
								className="cursor-pointer hover:text-red-500"
								onClick={() =>
									document
										.getElementById(`delete_modal_${postUuid}`)
										.showModal()
								}
							/>
						</>
					)}
				</span>
			)}
		</div>
	);
};

export default PostHeader;
