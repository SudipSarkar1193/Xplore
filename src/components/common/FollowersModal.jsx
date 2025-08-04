import React, { useEffect, useRef } from "react";
import { FaTimesCircle } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import UserListItem from "./UserListItem";

export const FollowersModal = ({
	isOpen,
	onClose,
	users,
	title,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
}) => {
	const loadMoreRef = useRef(null);
	const modalContentRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;

		console.log("Setting up IntersectionObserver for FollowersModal , users ", users);

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				root: modalContentRef.current, // Observe within the modal's content area
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
	}, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
			<div className="bg-gray-900 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700 flex flex-col">
				{/* Modal Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h2 className="text-xl font-bold text-white">{title}</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-gray-800 transition-colors"
					>
						<FaTimesCircle className="w-4 h-4 text-gray-400" />
					</button>
				</div>

				{/* Modal Content */}
				<div
					ref={modalContentRef}
					className="overflow-y-auto"
				>
					{users && users.length > 0 ? (
						<div className="divide-y divide-gray-700">
							{users.map((user) => (
								<UserListItem key={user.uuid} user={user} />
							))}
							<div ref={loadMoreRef} className="h-1" />
						</div>
					) : (
						<div className="p-8 text-center text-gray-400">
							No {title.toLowerCase()} to show
						</div>
					)}
					{isFetchingNextPage && (
						<div className="flex justify-center p-4">
							<LoadingSpinner size="md" />
						</div>
					)}
					{!hasNextPage && users && users.length > 0 && (
						<p className="text-center text-gray-500 py-4">You've reached the end!</p>
					)}
				</div>
			</div>
		</div>
	);
};