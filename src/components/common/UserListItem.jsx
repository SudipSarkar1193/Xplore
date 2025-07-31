import React from "react";
import useFollow from "../../custom_hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
const UserListItem = ({ user }) => {
	// Each list item now manages its own follow mutation and loading state.
	const { follow, isPending } = useFollow();

	// The user object passed as a prop contains the follow status.
	const isFollowing = user.currentUserFollowing;
	console.log("UserListItem", user);
	console.log("user.currentUserFollowing", user.currentUserFollowing);

	return (
		<div className="p-4 hover:bg-gray-800 transition-colors flex items-center gap-3">
			<Link to={`/profile/${user.username}`}>
				<img
					src={user.profilePictureUrl || "/avatar-placeholder.png"}
					alt={user.username}
					className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
				/>
			</Link>
			<div className="flex-1">
				<p className="font-semibold text-white hover:underline cursor-pointer">
					{user.username}
				</p>
				<p className="text-sm text-gray-400">@{user.username}</p>
			</div>
			<div>
				<button
					className="btn btn-sm btn-primary rounded-full min-w-[90px]" // Added min-width for consistency
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
