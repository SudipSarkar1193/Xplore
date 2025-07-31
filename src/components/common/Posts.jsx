import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx"; 

const Posts = ({ feedType, userUuid }) => {
	console.log("Posts component rendered with feedType:", feedType, "and userUuid:", userUuid);
	const { authToken } = useAuthContext(); // Get token from context

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
			case "following": // Using the same endpoint for now
				return `${backendServer}/api/posts/feed`;

			// NOTE: The backend endpoints for bookmarks, user posts, and likes are not yet available.

			case "bookmarks":
				return `${backendServer}/api/posts/bookmarks`;
			case "posts":
				return `${backendServer}/api/posts/user/${userUuid}`;
			case "likes":
				return `${backendServer}/api/posts/likes/${userUuid}`;
			default:
				return `${backendServer}/api/posts/feed`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const { data, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts", feedType, userUuid],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`, // Add JWT
					},
				});
				const jsonRes = await res.json();
				if (!res.ok) {
					throw new Error(jsonRes.message || "Failed to fetch posts");
				}
				// The backend now returns a paginated response, so we get the 'content' array
				return jsonRes.content;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, userUuid]);

	const posts = Array.isArray(data) ? data : [];
	console.log("Fetched posts:", posts);

	return (
		<div className="">
			{(isLoading || isRefetching) && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post.postUuid} post={post} feedType={feedType} />
					))}
				</div>
			)}
		</div>
	);
};
export default Posts;
