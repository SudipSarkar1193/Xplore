import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../../../utils/timeAgo.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";
import useLikePost from "../../../custom_hooks/useLikePost.js"; 
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import PostModals from "./PostModals";

const Post = ({ post, parentPostUuid, showInfo = false }) => {
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
		<div
			className="overflow-y-hidden no-scrollbar pr-4 cursor-pointer"
			onClick={() => navigate(`/post/${post.postUuid}`)}
		>
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<Link
						onClick={(e) => e.stopPropagation()}
						to={`/profile/${postOwner?.username}`}
					>
						<div className="w-8 rounded-full">
							<img src={postOwner?.profileImg || "/avatar-placeholder.png"} />
						</div>
					</Link>
				</div>
				<div className="flex flex-col flex-1">
					<PostHeader
						postOwner={postOwner}
						formattedDate={formattedDate}
						isMyPost={isMyPost}
						postUuid={post.postUuid}
					/>
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
	);
};

export default Post;