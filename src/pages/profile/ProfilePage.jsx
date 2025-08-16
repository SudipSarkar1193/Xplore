import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Post/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/memberSinceDate";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { FollowersModal } from "../../components/common/FollowersModal.jsx";

const ProfilePage = () => {
	const [feedType, setFeedType] = useState("posts");
	const [showFollowersModal, setShowFollowersModal] = useState(false);
	const [showFollowingModal, setShowFollowingModal] = useState(false);
	const { username } = useParams();
	const { authUser, authToken } = useAuthContext();
	const { follow, isPending: isFollowing } = useFollow();

	// Query to fetch the profile data for the user specified in the URL
	const {
		data: user,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			const res = await fetch(
				`${backendServer}/api/users/profile/${username}`,
				{
					headers: { Authorization: `Bearer ${authToken}` },
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "User not found");
			return data;
		},
		enabled: !!authToken,
	});

	// Query to fetch followers using useInfiniteQuery
	const {
		data: followersData,
		fetchNextPage: fetchFollowers,
		hasNextPage: hasNextFollowers,
		isFetchingNextPage: isFetchingFollowers,
	} = useInfiniteQuery({
		queryKey: ["userFollowers", user?.uuid],
		queryFn: async ({ pageParam = 0 }) => {
			const res = await fetch(
				`${backendServer}/api/users/${user.uuid}/followers?page=${pageParam}&size=5`,
				{
					headers: { Authorization: `Bearer ${authToken}` },
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch followers");
			return data;
		},
		getNextPageParam: (lastPage, allPages) =>
			lastPage.last ? undefined : allPages.length,
		initialPageParam: 0,
		enabled: !!user?.uuid && showFollowersModal,
	});

	// Query to fetch following using useInfiniteQuery
	const {
		data: followingData,
		fetchNextPage: fetchFollowing,
		hasNextPage: hasNextFollowing,
		isFetchingNextPage: isFetchingFollowing,
	} = useInfiniteQuery({
		queryKey: ["userFollowing", user?.uuid],
		queryFn: async ({ pageParam = 0 }) => {
			const res = await fetch(
				`${backendServer}/api/users/${user.uuid}/following?page=${pageParam}&size=5`,
				{
					headers: { Authorization: `Bearer ${authToken}` },
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch following");
			return data;
		},
		getNextPageParam: (lastPage, allPages) =>
			lastPage.last ? undefined : allPages.length,
		initialPageParam: 0,
		enabled: !!user?.uuid && showFollowingModal,
	});

	const isMyProfile = authUser?.username === username;
	const amIFollowing = user?.currentUserFollowing || false;

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	const followers = followersData?.pages.flatMap((page) => page.content) || [];
	const following = followingData?.pages.flatMap((page) => page.content) || [];

	return (
		<>
			<div className="flex-[4_4_0] overflow-x-hidden border-r border-gray-700 min-h-screen bg-gray-950">
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && (
					<div className="text-center mt-8 p-8">
						<p className="text-xl text-gray-400 mb-2">User not found</p>
						<p className="text-gray-500">
							The profile you're looking for doesn't exist.
						</p>
					</div>
				)}
				{!isLoading && !isRefetching && user && (
					<>
						<div className="flex flex-col">
							{/* Header */}
							<div className="flex gap-10 px-4 py-3 items-center backdrop-blur-md bg-gray-950/80 sticky top-0 z-10 border-b border-gray-800">
								<Link
									to="/"
									className="hover:bg-gray-800 p-2 rounded-full transition-colors"
								>
									<FaArrowLeft className="w-4 h-4 text-white" />
								</Link>
								<div className="flex flex-col">
									<p className="font-bold text-xl text-white">
										{user.username}
									</p>
									<span className="text-sm text-gray-400">
										{user.postCount || 0} posts
									</span>
								</div>
							</div>

							{/* Cover Image */}
							<div className="relative group/cover">
								<div className="h-52 w-full bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
									<img
										src={user.coverImg || "/cover.png"}
										className="h-full w-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
										alt="cover image"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
								</div>

								{/* User Avatar */}
								<div className="avatar absolute -bottom-16 left-6">
									<div className="w-32 h-32 rounded-full ring-4 ring-gray-900 bg-gray-900">
										<img
											src={user.profilePictureUrl || "/avatar-placeholder.png"}
											className="w-full h-full rounded-full object-cover"
											alt="profile"
										/>
									</div>
								</div>
							</div>

							{/* Action Button */}
							<div className="flex justify-end px-6 mt-5">
								{isMyProfile && <EditProfileModal authUser={user} />}
								{!isMyProfile && (
									<button
										className={`btn rounded-full px-6 py-2 font-semibold transition-all duration-200 ${
											amIFollowing
												? "bg-gray-800 hover:bg-red-900 border border-gray-600 hover:border-red-600 text-white hover:text-red-400"
												: "bg-white text-black hover:bg-gray-200"
										}`}
										onClick={() => follow(user.uuid)}
										disabled={isFollowing}
									>
										{isFollowing ? (
											<LoadingSpinner size="sm" />
										) : amIFollowing ? (
											"Unfollow"
										) : (
											"Follow"
										)}
									</button>
								)}
							</div>

							{/* Profile Info */}
							<div className="flex flex-col gap-4 mt-16 px-6">
								<div className="flex flex-col">
									<span className="font-bold text-2xl text-white">
										{user.username}
									</span>
									<span className="text-gray-400">@{user.username}</span>
									<span className="text-gray-300 mt-3 leading-relaxed">
										{user.bio || "No bio available."}
									</span>
								</div>

								<div className="flex gap-2 items-center text-gray-400">
									<IoCalendarOutline className="w-4 h-4" />
									<span className="text-sm">
										Joined {formatMemberSinceDate(user.createdAt)}
									</span>
								</div>

								{/* Followers/Following Stats */}
								<div className="flex gap-6">
									<button
										className="flex gap-1 items-center hover:underline transition-colors group"
										onClick={() => setShowFollowingModal(true)}
									>
										<span className="font-bold text-white group-hover:text-blue-400 transition-colors">
											{user.followingCount}
										</span>
										<span className="text-gray-400 group-hover:text-blue-400 transition-colors">
											Following
										</span>
									</button>
									<button
										className="flex gap-1 items-center hover:underline transition-colors group"
										onClick={() => setShowFollowersModal(true)}
									>
										<span className="font-bold text-white group-hover:text-blue-400 transition-colors">
											{user.followersCount}
										</span>
										<span className="text-gray-400 group-hover:text-blue-400 transition-colors">
											Followers
										</span>
									</button>
								</div>
							</div>

							{/* Tabs */}
							<div className="flex w-full border-b border-gray-700 mt-8">
								<div
									className={`flex justify-center flex-1 p-4 hover:bg-gray-800 transition duration-300 relative cursor-pointer ${
										feedType === "posts" ? "text-white" : "text-gray-400"
									}`}
									onClick={() => setFeedType("posts")}
								>
									<span className="font-medium">Posts</span>
									{feedType === "posts" && (
										<div className="absolute bottom-0 w-12 h-1 rounded-full bg-blue-500" />
									)}
								</div>
								<div
									className={`flex justify-center flex-1 p-4 hover:bg-gray-800 transition duration-300 relative cursor-pointer ${
										feedType === "likes" ? "text-white" : "text-gray-400"
									}`}
									onClick={() => setFeedType("likes")}
								>
									<span className="font-medium">Likes</span>
									{feedType === "likes" && (
										<div className="absolute bottom-0 w-12 h-1 rounded-full bg-blue-500" />
									)}
								</div>
							</div>
						</div>

						<Posts
							feedType={feedType}
							userUuid={user.uuid}
							isProfilePage={true}
						/>
					</>
				)}
			</div>

			{/* Modals */}
			<FollowersModal
				isOpen={showFollowersModal}
				onClose={() => setShowFollowersModal(false)}
				users={followers}
				title="Followers"
				fetchNextPage={fetchFollowers}
				hasNextPage={hasNextFollowers}
				isFetchingNextPage={isFetchingFollowers}
			/>
			<FollowersModal
				isOpen={showFollowingModal}
				onClose={() => setShowFollowingModal(false)}
				users={following}
				title="Following"
				fetchNextPage={fetchFollowing}
				hasNextPage={hasNextFollowing}
				isFetchingNextPage={isFetchingFollowing}
			/>
		</>
	);
};

export default ProfilePage;
