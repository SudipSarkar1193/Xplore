import React, { useEffect, useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { backendServer } from "../../BackendServer";
import LoadingSpinner from "./LoadingSpinner";
import RightPanel from "./RightPanel";
import UserListItem from "./UserListItem";

export const SearchUser = ({
	show = false,
	isModalMode = false,
	setIsSearchModalOpen,
}) => {
	const [search, setSearch] = useState("");
	const { authToken } = useAuthContext();
	const loadMoreRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const [allUsers, setAllUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["allUsers"],
			queryFn: async ({ pageParam = 0 }) => {
				const res = await fetch(
					`${backendServer}/api/users/all?page=${pageParam}&size=22`,
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
				return data;
			},
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.last ? undefined : allPages.length;
			},
			initialPageParam: 0,
			enabled: !!authToken,
		});

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				root: scrollContainerRef.current,
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

	useEffect(() => {
		if (data) {
			setAllUsers(data.pages.flatMap((page) => page.content) || []);
		}
	}, [data]);

	useEffect(() => {
		if (search) {
			setFilteredUsers(
				allUsers.filter(
					(user) =>
						user &&
						(user.username.toLowerCase().includes(search.toLowerCase()) ||
							(user.fullName &&
								user.fullName.toLowerCase().includes(search.toLowerCase())))
				)
			);
		} else {
			setFilteredUsers([]);
		}
	}, [search, allUsers]);

	const containerClasses = isModalMode
		? "w-full"
		: `${
				show ? "block" : "hidden"
		  } lg:block lg:w-[450px] flex-shrink-0 h-screen`;

	return (
		<div className={containerClasses}>
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

						<p className="font-bold mb-2 text-xl md:text-2xl text-center">
							{search ? "Search Results" : "Suggested Users"}
						</p>

						<div
							ref={scrollContainerRef}
							className="max-h-screen overflow-y-auto no-scrollbar"
						>
							{!search && <RightPanel />}

							{search && isLoading && !data && <LoadingSpinner />}

							{search &&
								filteredUsers.map((user) => (
									<UserListItem
										key={user.uuid}
										user={user}
										setIsSearchModalOpen={setIsSearchModalOpen}
									/>
								))}

							{search &&
								filteredUsers.length === 0 &&
								hasNextPage &&
								!isFetchingNextPage && (
									<div className="flex justify-center">
										<button
											className="btn btn-primary btn-sm my-4"
											onClick={() => fetchNextPage()}
										>
											Load More Results
										</button>
									</div>
								)}

							{search &&
								filteredUsers.length === 0 &&
								!hasNextPage &&
								!isLoading && (
									<p className="text-center my-4">
										No users found matching your search.
									</p>
								)}

							{search && filteredUsers.length > 0 && hasNextPage && (
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
