// src/components/common/RightPanel.jsx

import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx";

const RightPanel = () => {
	const { authToken, authUser } = useAuthContext();
	const { follow, isPending } = useFollow();

	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/users/suggestions`, {
					headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = await res.json();
				if (!res.ok)
					throw new Error(data.message || "Failed to fetch suggestions");
				return data;
			} catch (error) {
				console.error(`Error at ${backendServer}/api/users/suggestions`, error);
				return []; // Return empty array on error
			}
		},
		enabled: !!authToken,
	});

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<RightPanelSkeleton />
				<RightPanelSkeleton />
				<RightPanelSkeleton />
			</div>
		);
	}

	return (
		<div className="hidden lg:block my-4 mx-4">
			<div className="bg-gray-800 p-4 rounded-md sticky top-2">
				<p className="font-bold">Who to follow</p>
				<div className="flex flex-col gap-4 mt-2">
					{suggestedUsers?.map((user) => {
						const amIFollowing = authUser?.following?.some(
							(f) => f.uuid === user.uuid
						);
						return (
							<Link
								to={`/profile/${user.username}`}
								className="flex items-center justify-between gap-4"
								key={user.uuid}
							>
								<div className="flex gap-2 items-center">
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img
												src={
													user.profilePictureUrl || "/avatar-placeholder.png"
												}
											/>
										</div>
									</div>
									<div className="flex flex-col">
										<span className="font-semibold tracking-tight truncate w-28">
											{user.username}
										</span>
										<span className="text-sm text-slate-500">
											@{user.username}
										</span>
									</div>
								</div>
								<div>
									<button
										className="btn btn-sm btn-primary rounded-full"
										onClick={(e) => {
											e.preventDefault();
											follow(user.uuid);
										}}
									>
										{isPending ? (
											<LoadingSpinner size="sm" />
										) : amIFollowing ? (
											"Unfollow"
										) : (
											"Follow"
										)}
									</button>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
