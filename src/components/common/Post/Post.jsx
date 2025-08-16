import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import LoadingSpinner from "../LoadingSpinner.jsx";
import { timeAgo } from "../../../utils/timeAgo.js";
import { backendServer } from "../../../BackendServer.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import PostModals from "./PostModals";

const Post = ({ post, feedType, parentPostUuid, showInfo = false }) => {
	const { authUser, authToken } = useAuthContext();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
	const [likeCount, setLikeCount] = useState(post.likeCount);

	const postOwner = {
		username: post.authorUsername,
		uuid: post.authorUuid,
		profileImg: post.authorProfilePictureUrl || "/avatar-placeholder.png",
	};

	const formattedDate = timeAgo(post.createdAt);
	const isMyPost = authUser?.uuid === post.authorUuid;
	const isBookmarked = authUser?.bookmarks?.includes(post.postUuid);

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(
				`${backendServer}/api/posts/${post.postUuid}/like`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${authToken}` },
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to like post");
			return data;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["posts", feedType] });
			const previousState = { isLiked, likeCount };
			setIsLiked((prev) => !prev);
			setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
			return { previousState };
		},
		onError: (err, variables, context) => {
			if (context?.previousState) {
				setIsLiked(context.previousState.isLiked);
				setLikeCount(context.previousState.likeCount);
			}
			toast.error(err.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
			queryClient.invalidateQueries({ queryKey: ["post", post.postUuid] });
		},
	});

	const handleLikePost = (e) => {
		e.preventDefault();
		e.stopPropagation();
		!isLiking && likePost();
	};

	return (
		<div
			className="overflow-y-hidden no-scrollbar pr-4 cursor-pointer"
			onClick={() => navigate(`/post/${post.postUuid}`)}
		>
			<div className="flex gap-2 items-start p-4 border-b border-gray-700">
				<div className="avatar">
					<div className="w-8 rounded-full">
						<Link
							onClick={(e) => e.stopPropagation()}
							to={`/profile/${postOwner?.username}`}
						>
							<img src={postOwner?.profileImg || "/avatar-placeholder.png"} />
						</Link>
					</div>
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
						isLiked={isLiked}
						likeCount={likeCount}
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
