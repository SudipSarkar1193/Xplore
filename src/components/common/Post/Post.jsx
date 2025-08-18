import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../../../utils/timeAgo.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";
import useLikePost from "../../../custom_hooks/useLikePost.js";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import PostModals from "./PostModals";

const Post = ({
	post,
	parentPostUuid,
	showInfo = false,
	isProfilePage = false,
}) => {
	const { authUser } = useAuthContext();
	const navigate = useNavigate();

	const { likePost, isLiking } = useLikePost();

	const postOwner = {
		username: post.authorUsername,
		uuid: post.authorUuid,
		profileImg: post.authorProfilePictureUrl || "/avatar-placeholder.png",
	};

	const formattedDate = timeAgo(post.createdAt);
	const isMyPost = authUser?.uuid === post.authorUuid;
	const isBookmarked = authUser?.bookmarks?.includes(post.postUuid);

	const handleLikePost = (e) => {
		e.stopPropagation();
		if (isLiking) return;
		likePost(post.postUuid);
	};

	return (
		<>
			<div className="overflow-y-auto overflow-x-auto no-scrollbar  h-5"> </div>
			<div
				className="overflow-y-auto overflow-x-auto no-scrollbar cursor-pointer"
				onClick={() => navigate(`/post/${post.postUuid}`)}
			>
				{isProfilePage && post && post.parentPostUuid && (
					<div
						className="p-1 text-sm flex items-center justify-center bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors duration-200 italic"
						onClick={(e) => {
							e.stopPropagation();
							navigate(`/post/${post.parentPostUuid}`);
						}}
					>
						{"replied to the post 👉"}

						<span className="ml-2 hidden md:inline hover:text-blue-500 active:text-blue-500 break-words">
							{post.postUuid}
						</span>

						<span className="ml-2 md:hidden hover:text-blue-500 active:text-blue-500 break-words">
							{post.postUuid.slice(0, 8)}...
						</span>
					</div>
				)}

				<div className="p-5 flex flex-col gap-2 items-start py-4  border-b border-gray-700">
					<div className="flex items-center gap-2">
						<div className="avatar">
							<Link
								onClick={(e) => e.stopPropagation()}
								to={`/profile/${postOwner?.username}`}
							>
								<div className="w-8 rounded-full">
									<img
										src={postOwner?.profileImg || "/avatar-placeholder.png"}
									/>
								</div>
							</Link>
						</div>
						<PostHeader
							postOwner={postOwner}
							formattedDate={formattedDate}
							isMyPost={isMyPost}
							postUuid={post.postUuid}
						/>
					</div>
					<div className="flex flex-col flex-1  w-full">
						<PostBody content={post.content} imageUrls={post.imageUrls} />
						<PostFooter
							post={post}
							isLiking={isLiking}
							isLiked={post.likedByCurrentUser}
							likeCount={post.likeCount}
							isBookmarked={isBookmarked}
							handleLikePost={handleLikePost}
							showInfo={showInfo}
						/>
					</div>
				</div>
				{isMyPost && <PostModals post={post} parentPostUuid={parentPostUuid} />}
			</div>
		</>
	);
};

export default Post;

// {post && post.parentPostUuid && (
// 				<div className="w-[70%] py-[1/2] text-sm flex items-center justify-center border border-blue-600">{`Comment of the post ${post.postUuid}`}</div>
// 			)}
