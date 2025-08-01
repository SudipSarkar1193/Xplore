import {
	FaRegComment,
	FaHeart,
	FaRegHeart,
	FaBookmark,
	FaRegBookmark,
} from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";

const PostFooter = ({
	post,
	isLiking,
	isLiked,
	likeCount,
	isBookmarked,
	handleLikePost,
}) => {
	return (
		<div className="flex justify-between mt-3">
			<div className="flex gap-4 items-center w-2/3 justify-between">
				<div
					className="flex gap-1 items-center cursor-pointer group"
					onClick={() =>
						document
							.getElementById(`comments_modal_${post.postUuid}`)
							.showModal()
					}
				>
					<FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
					<span className="text-sm text-slate-500 group-hover:text-sky-400">
						{post.commentCount}
					</span>
				</div>
				<div
					className="flex gap-1 items-center group cursor-pointer"
					onClick={handleLikePost}
				>
					{isLiking ? (
						<LoadingSpinner size="sm" />
					) : isLiked ? (
						<FaHeart className="w-4 h-4 text-pink-600" />
					) : (
						<FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
					)}
					<span
						className={`text-sm ${
							isLiked ? "text-pink-600" : "text-slate-500"
						} group-hover:text-pink-500`}
					>
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
	);
};

export default PostFooter;
