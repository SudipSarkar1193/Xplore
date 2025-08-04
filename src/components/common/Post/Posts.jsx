import Post from "./Post.jsx";
import PostSkeleton from "../../skeletons/PostSkeleton.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { backendServer } from "../../../BackendServer.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";

const Posts = ({ feedType, userUuid }) => {
	const { authToken } = useAuthContext();

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
			case "following":
				return `${backendServer}/api/posts/feed`;
			case "posts":
				return `${backendServer}/api/posts/user/${userUuid}`;
			case "likes":
				return `${backendServer}/api/posts/likes/${userUuid}`;
			default:
				return `${backendServer}/api/posts/feed`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data,
		isLoading,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["posts", feedType, userUuid],
		queryFn: async ({ pageParam = 0 }) => {
			try {
				const res = await fetch(`${POST_ENDPOINT}?page=${pageParam}`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Failed to fetch posts");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.isLast ? undefined : allPages.length;
		},
		initialPageParam: 0,
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, userUuid]);

	const posts = data?.pages.flatMap((page) => page.content) || [];

	return (
		<div className="">
			{(isLoading || isRefetching) && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
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