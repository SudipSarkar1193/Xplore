import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/memberSinceDate";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx";

const ProfilePage = () => {
	const [feedType, setFeedType] = useState("posts");
	const { username } = useParams();
	const { authUser, authToken } = useAuthContext();
	const { follow, isPending: isFollowing } = useFollow();

	// Query to fetch the profile data for the user specified in the URL
	const { data: user, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/users/profile/${username}`, {
					headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "User not found");
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		enabled: !!authToken, // Only run query if authToken exists
	});

	const isMyProfile = authUser?.username === username;
	const amIFollowing = authUser?.following?.some(f => f.username === username);

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	// Note: The backend endpoints for user-specific posts and liked posts are not available yet.
	// The "Posts" and "Likes" tabs will not function correctly until they are implemented.

	return (
		<div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen">
			{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
			{!isLoading && !isRefetching && !user && <p className="text-center text-lg mt-4">User not found.</p>}
			{!isLoading && !isRefetching && user && (
				<>
					<div className="flex flex-col">
						<div className="flex gap-10 px-4 py-2 items-center">
							<Link to="/">
								<FaArrowLeft className="w-4 h-4" />
							</Link>
							<div className="flex flex-col">
								<p className="font-bold text-lg">{user.username}</p>
								<span className="text-sm text-slate-500">{user.postCount || 0} posts</span>
							</div>
						</div>
						{/* COVER IMG */}
						<div className="relative group/cover">
							<img src={user.coverImg || "/cover.png"} className="h-52 w-full object-cover" alt="cover image" />
							{/* USER AVATAR */}
							<div className="avatar absolute -bottom-16 left-4">
								<div className="w-32 rounded-full">
									<img src={user.profilePictureUrl || "/avatar-placeholder.png"} />
								</div>
							</div>
						</div>
						<div className="flex justify-end px-4 mt-5">
							{isMyProfile && <EditProfileModal authUser={user} />}
							{!isMyProfile && (
								<button className="btn btn-outline rounded-full btn-sm" onClick={() => follow(user.uuid)}>
									{isFollowing ? <LoadingSpinner size="sm" /> : amIFollowing ? "Unfollow" : "Follow"}
								</button>
							)}
						</div>
						<div className="flex flex-col gap-4 mt-14 px-4">
							<div className="flex flex-col">
								<span className="font-bold text-lg">{user.username}</span>
								<span className="text-sm text-slate-500">@{user.username}</span>
								<span className="text-sm my-1">{user.bio || "No bio available."}</span>
							</div>
							<div className="flex gap-2 items-center">
								<IoCalendarOutline className="w-4 h-4 text-slate-500" />
								<span className="text-sm text-slate-500">{formatMemberSinceDate(user.createdAt)}</span>
							</div>
							<div className="flex gap-2">
								<div className="flex gap-1 items-center">
									<span className="font-bold text-xs">{user.followingCount}</span>
									<span className="text-slate-500 text-xs">Following</span>
								</div>
								<div className="flex gap-1 items-center">
									<span className="font-bold text-xs">{user.followersCount}</span>
									<span className="text-slate-500 text-xs">Followers</span>
								</div>
							</div>
						</div>
						<div className="flex w-full border-b border-gray-700 mt-4">
							<div
								className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
								onClick={() => setFeedType("posts")}
							>
								Posts
								{feedType === "posts" && <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />}
							</div>
							<div
								className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
								onClick={() => setFeedType("likes")}
							>
								Likes
								{feedType === "likes" && <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />}
							</div>
						</div>
					</div>
					<Posts feedType={feedType} userId={user.uuid} />
				</>
			)}
		</div>
	);
};
export default ProfilePage;