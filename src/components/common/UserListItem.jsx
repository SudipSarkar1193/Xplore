import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";

const UserListItem = ({ user, setIsSearchModalOpen }) => {
	const { follow, isPending } = useFollow();
	const queryClient = useQueryClient();

	// Helper function to find user's current follow status in cache
	const getCurrentFollowStatus = () => {
		// Getting all cached queries that might contain users
		const allQueries = [
			...queryClient.getQueriesData({ queryKey: ["userFollowers"] }),
			...queryClient.getQueriesData({ queryKey: ["userFollowing"] }),
			...queryClient.getQueriesData({ queryKey: ["suggestedUsers"] }),
			...queryClient.getQueriesData({ queryKey: ["userProfile"] }),
		];

		// Searching through all cached data to find this user
		for (const [queryKey, data] of allQueries) {
			if (data) {
				const foundUser = findUserInData(data, user.uuid);
				if (foundUser) {
					return foundUser.currentUserFollowing;
				}
			}
		}

		// Fallback to prop value if not found in cache
		return user.currentUserFollowing;
	};

	// ✅ Recursive function to find user in nested data structures
	const findUserInData = (data, targetUuid) => {
		if (!data) return null;

		// Handling arrays
		if (Array.isArray(data)) {
			for (const item of data) {
				const found = findUserInData(item, targetUuid);
				if (found) return found;
			}
			return null;
		}

		// Handling objects
		if (typeof data === "object") {
			// Checking if this object is the user we're looking for
			if (data.uuid === targetUuid || data.userUuid === targetUuid) {
				return data;
			}

			// Recursively search all properties
			for (const key in data) {
				if (data[key] && typeof data[key] === "object") {
					const found = findUserInData(data[key], targetUuid);
					if (found) return found;
				}
			}
		}

		return null;
	};

	// ✅ Getting current follow status from cache -> this will update when cache updates
	const isFollowing = getCurrentFollowStatus();

	return (
		<div className="p-4 hover:bg-gray-800 transition-colors flex items-center  gap-3">
			<Link
				to={`/profile/${user.username}`}
				className="flex gap-2 flex-1 items-center justify-self-start"
				onClick={() => setIsSearchModalOpen(false)}
			>
				<img
					src={user.profilePictureUrl || "/avatar-placeholder.png"}
					alt={user.username}
					className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
				/>

				<div className="flex-1">
					<p className="font-semibold italic text-white hover:underline cursor-pointer">
						{user.username.length > 10
							? user.username.slice(0, 10) + "..."
							: user.username}
					</p>
				</div>
			</Link>
			<div>
				<button
					className="btn btn-sm btn-primary rounded-full min-w-[90px]"
					onClick={() => follow(user.uuid)}
					disabled={isPending}
				>
					{isPending ? (
						<LoadingSpinner size="sm" />
					) : isFollowing ? (
						"Unfollow"
					) : (
						"Follow"
					)}
				</button>
			</div>
		</div>
	);
};

export default UserListItem;
