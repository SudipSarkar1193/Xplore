import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";

import Post from "../../components/common/Post/Post";
import PostSkeleton from "../../components/skeletons/PostSkeleton";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext";
import CreatePost from "../home/CreatePost";

const PostPage = () => {
	const { postUuid } = useParams();
	const { authToken } = useAuthContext();

	const {
		data: post,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["post", postUuid],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/posts/${postUuid}`, {
					headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Post not found");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		enabled: !!authToken,
	});

	useEffect(() => {
		refetch();
	}, [postUuid, refetch]);

	return (
		<div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-gray-950">
			{(isLoading || isRefetching) && <PostSkeleton />}
			{!isLoading && !isRefetching && !post && (
				<div className="text-center p-4">Post not found</div>
			)}
			{!isLoading && !isRefetching && post && (
				<div>
					<div className="flex gap-10 px-4 py-3 items-center backdrop-blur-md bg-gray-950/80 sticky top-0 z-10 border-b border-gray-800">
						<Link
							to={`${
								post.parentPostUuid ? `/post/${post.parentPostUuid}` : "/"
							}`}
							className="hover:bg-gray-800 p-2 rounded-full transition-colors"
						>
							<FaArrowLeft className="w-4 h-4 text-white" />
						</Link>
						<h2 className="text-xl font-bold">Post</h2>
					</div>
					<Post post={post} showInfo={true} />
					<div className="border-t border-gray-700 my-4">
						<h3 className="text-xl font-bold px-4 py-2">Replies</h3>
						<CreatePost parentPostUuid={post.postUuid} />
						{post.comments && post.comments.length > 0 ? (
							post.comments.map((comment) => (
								<Post
									key={comment.postUuid}
									post={comment}
									parentPostUuid={post.postUuid}
									showInfo={true}
								/>
							))
						) : (
							<p className="text-center text-gray-500 py-4">No replies yet.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PostPage;
