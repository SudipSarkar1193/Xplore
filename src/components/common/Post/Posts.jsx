import Post from "./Post.jsx";
import PostSkeleton from "../../skeletons/PostSkeleton.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { backendServer } from "../../../BackendServer.js";
import { useAuthContext } from "../../../context/AuthContext.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";

const Posts = ({ feedType, userUuid }) => {
	const { authToken } = useAuthContext();
	const loadMoreRef = useRef(null);

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
			const pageSize = 5;
			try {
				const res = await fetch(
					`${POST_ENDPOINT}?page=${pageParam}&size=${pageSize}`,
					{
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Failed to fetch posts");
				}
				//console.log("Fetched posts: **************************", data);
				// if (data.isLast) {
				// 	return { ...data, isLast: true };
				// }
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		getNextPageParam: (lastPage, allPages) => {
			//console.log("lastPage:", lastPage);
			//console.log("allPages:", allPages);
			return lastPage.last  ? undefined : allPages.length;
		},
		initialPageParam: 0,
	});

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				console.log("Observer triggered , entries", entries);
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		console.log("Fetched posts (inside useEffect):", data);

		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		refetch();
	}, [feedType, refetch, userUuid]);

	const posts = data?.pages.flatMap((page) => page.content) || [];

	return (
		<div>
			{(isLoading || isRefetching) && !isFetchingNextPage && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{posts && (
				<div>
					{posts.map((post) => (
						<Post key={post.postUuid} post={post} feedType={feedType} />
					))}
				</div>
			)}
			<div ref={loadMoreRef} className="h-1 w-full "></div>
			{isFetchingNextPage && <LoadingSpinner />}
			{!hasNextPage && !isLoading && !isRefetching && posts.length > 0 && (
				<p className="text-center my-4">You've reached the end!</p>
			)}
		</div>
	);
};
export default Posts;
