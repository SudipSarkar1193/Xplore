import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import RightPanel from "./RightPanel";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import useFollow from "../../custom_hooks/useFollow";
import { backendServer } from "../../BackendServer";
import { Link } from "react-router-dom";

const UserList = ({ limit = 15, users, isLoading }) => {
	const [loadingUserId, setLoadingUserId] = useState(null);

	const { data: authUser } = useQuery({ queryKey: ["userAuth"] });

	const { followUnfollow, isPending } = useFollow();
	const queryClient = useQueryClient();
	const handleFollow = (e, id) => {
		e.preventDefault();
		setLoadingUserId(String(id));
		try {
			followUnfollow(id, authUser?._id);

			// Optimistically update the UI
			let userId = id;
			let isFollowingProfile = authUser?.following.includes(id);

			//If my own profile:
			if(isFollowingProfile) 
			queryClient.setQueryData(["followings", authUser?._id], (oldData) =>
				oldData?.filter((usr) =>
					isFollowingProfile ? usr._id != userId : [...oldData]
				)
			);
		} catch (error) {
			console.error("Error during follow/unfollow:", error);
		}
	};

	return (
		<div className={`  lg:block sticky my-4 ml-4 right:0 `}>
			<div className={`block lg:block   p-4 rounded-md sticky top-2`}>
				<div className="flex flex-col gap-4">
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						users?.map((user) => {
							const isFollowing = authUser?.following.includes(user?._id);

							return (
								<div className="flex items-center justify-between gap-4">
									<Link to={`/profile/${user?.username}`} key={user._id}>
										<div className="flex gap-2 items-center">
											<div className="avatar">
												<div className="w-8 rounded-full">
													<img
														src={user.profileImg}
													/>
												</div>
												{user.isOnline && (
													<div className="w-3 h-3 bg-green-600 rounded-full ring-2 ring-green-400 absolute bottom-0 right-0"></div>
												)}
											</div>
											<div className="flex flex-col">
												<span className="font-semibold tracking-tight truncate w-28">
													{user.fullName}
												</span>
												<span className="text-sm text-slate-500">
													@
													{user.username.length < limit - 3
														? user.username
														: user.username.slice(0, limit - 3) + "..."}
												</span>
											</div>
										</div>
									</Link>
									<div>
										<button
											className="btn btn-outline rounded-full btn-sm"
											onClick={(e) => handleFollow(e, user._id)}
										>
											{isPending && loadingUserId == user._id.toString() && (
												<LoadingSpinner size="sm" />
											)}

											{isPending &&
												loadingUserId != user._id.toString() &&
												(isFollowing ? "Unfollow" : "Follow")}

											{!isPending && (isFollowing ? "Unfollow" : "Follow")}
										</button>
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default UserList;
