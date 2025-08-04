import React, { useEffect, useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { backendServer } from "../../BackendServer";
import LoadingSpinner from "./LoadingSpinner";
import RightPanel from "./RightPanel";
import UserListItem from "./UserListItem";

export const SearchUser = ({ show = false }) => {
	const [search, setSearch] = useState("");
	const { authToken } = useAuthContext();
	const loadMoreRef = useRef(null);
	const scrollContainerRef = useRef(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["allUsers"],
			queryFn: async ({ pageParam = 0 }) => {
				console.log("Fetching users for page:", pageParam);
				const res = await fetch(
					`${backendServer}/api/users/all?page=${pageParam}&size=15`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
				if (!res.ok) {
					throw new Error("Failed to fetch users");
				}
				const data = await res.json();
				console.log("Fetched users:-->", data);
				return data;
			},
			getNextPageParam: (lastPage, allPages) => {
				console.log("lastPage:", lastPage);
				console.log("allPages:", allPages);
				console.log("lastPage.last:", lastPage.last);
				return lastPage.last ? undefined : allPages.length;
			},

			initialPageParam: 0,
			enabled: !!authToken,
		});

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				console.log("IntersectionObserver entries:", entries);
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				root: scrollContainerRef.current, // Observe inside the scrollable div
				threshold: 0.1,
			}
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allUsers = data?.pages.flatMap((page) => page.content) || [];

	console.log("All users fetched:", allUsers);

	const filteredUsers = search
		? allUsers.filter(
				(user) =>
					user &&
					(user.username.toLowerCase().includes(search.toLowerCase()) ||
						(user.fullName &&
							user.fullName.toLowerCase().includes(search.toLowerCase())))
		  )
		: [];

	return (
		<div className={`${show ? "block" : "hidden"} lg:block h-screen`}>
			<div className="flex items-center justify-center">
				<div className="block lg:block bg-transparent p-4 rounded-md">
					<div className="flex flex-col gap-4">
						<label className="input input-bordered border-blue-500 rounded-lg flex items-center gap-2">
							<FaSearch />
							<input
								type="text"
								placeholder="Search for users"
								onChange={(e) => setSearch(e.target.value)}
							/>
						</label>

						<p className="font-bold mb-2">
							{search ? "Search Results" : "Who to follow..."}
						</p>

						<div
							ref={scrollContainerRef}
							className="max-h-[70vh] overflow-y-auto"
						>
							{!search && <RightPanel con={true} />}

							{search && isLoading && <LoadingSpinner />}

							{search &&
								filteredUsers.map((user) => (
									<UserListItem key={user.uuid} user={user} />
								))}

							{search && hasNextPage && (
								<div ref={loadMoreRef} className="h-1" />
							)}

							{search && isFetchingNextPage && (
								<div className="flex justify-center p-2">
									<LoadingSpinner size="sm" />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
