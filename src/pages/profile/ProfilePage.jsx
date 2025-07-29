import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/memberSinceDate";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useUpdateUserProfile from "../../custom_hooks/useUpdateProfile.js";
import { backendServer } from "../../BackendServer.js";

import UserList from "../../components/common/UserList.jsx";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	let { username } = useParams();

	const queryClient = useQueryClient();
	const { followUnfollow, isPending: isPendingFollow } = useFollow();

	const { data: posts } = useQuery({ queryKey: ["posts"] });

	let {
		data: user,
		isLoading,
		isFetching: isUserProfileFetching,
		refetch: userProfileRefecth,
	} = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/profile/${username}`,
					{
						method: "GET",
						credentials: "include",
					}
				);

				const jsonRes = await res.json();

				if (!res.ok) {
					throw new Error("Error fetching user data");
				}

				return jsonRes.data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { data: followers, isLoading: isfollowersLoading } = useQuery({
		queryKey: ["followers", user?._id],
		queryFn: async () => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/getfollowers/${user?._id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				);

				if (!res.ok) {
					return null;
				}
				const jsonRes = await res.json();

				return await jsonRes.data.followers;
			} catch (error) {
				console.error(error.message || "Error fetching followers");
			}
		},
		retry: false,
	});

	const { data: followings, isLoading: isfollowingsLoading } = useQuery({
		queryKey: ["followings", user?._id],
		queryFn: async () => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/getfollowings/${user?._id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				);

				if (!res.ok) {
					return null;
				}
				const jsonRes = await res.json();

				return await jsonRes.data.followings;
			} catch (error) {
				console.error(error.message || "Error fetching followers");
			}
		},
		retry: false,
	});

	useEffect(() => {
		userProfileRefecth();
	}, [username, user, followers, followings]);

	const { data: authUser } = useQuery({ queryKey: ["userAuth"] });

	const isMyProfile = authUser?._id == user?._id;

	const isFollowing = authUser?.following.includes(user?._id);

	const followUnfollowHandler = (e) => {
		e.preventDefault();
		try {
			followUnfollow(user._id, authUser?._id);

			// Optimistically update the UI
			let userId = user._id;

			//If i follow someone else's profile :
			queryClient.setQueryData(["followers", userId], (oldData) => {
				isFollowing
					? oldData?.filter((usr) => usr._id != authUser._id)
					: [...oldData, authUser];
			});

			//If my own profile:
			queryClient.setQueryData(["followings", authUser?._id], (oldData) =>
				oldData?.filter((usr) =>
					isFollowing ? usr._id != userId : [...oldData]
				)
			);
		} catch (error) {
			console.error(error.message, ":", error);
		}
	};

	// Habdling update cover and profile img:

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const { updateProfile, isUpdatingProfile, isSuccess } =
		useUpdateUserProfile();

	const handleUpdateProfile = async (e) => {
		//e.preventDefault();
		await updateProfile({ profileImg, coverImg });
		setProfileImg(null);
		setCoverImg(null);
	};

	return (
		<div className="flex-[4_4_0]  border-r border-gray-700 ">
			{/* HEADER */}
			{isLoading && <ProfileHeaderSkeleton />}

			{!isLoading && !user && (
				<p className="text-center text-lg mt-4">User not found</p>
			)}

			<dialog id="followers-modal" className="modal ">
				<div className="modal-box absolute z-70 top-12">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
							<GrClose size={27} />
						</button>
					</form>
					<div className="w-full flex justify-center text-lg text-white">
						Followers
					</div>
					{isLoading ? (
						<LoadingSpinner />
					) : followers?.length == 0 ? (
						<div className="w-full flex justify-center text-lg text-white">
							Whoops! Nobody follows you 🥲
						</div>
					) : (
						<UserList users={followers} isLoading={isfollowersLoading} />
					)}
				</div>
			</dialog>

			<dialog id="following-modal" className="modal ">
				<div className="modal-box absolute z-70 top-12">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
							<GrClose size={27} />
						</button>
					</form>
					<div className="w-full flex justify-center text-lg text-white">
						Following
					</div>
					{isLoading ? (
						<LoadingSpinner />
					) : followings?.length == 0 ? (
						<div className="w-full flex justify-center text-lg text-white">
							hOOh! You follow nobody 🥸
						</div>
					) : (
						<UserList users={followings} isLoading={isfollowingsLoading} />
					)}
				</div>
			</dialog>

			<div className="flex flex-col  border-r border-gray-700">
				{!isLoading && user && (
					<div className="bg-transparent">
						<div className="flex gap-10 px-4 py-2 items-center">
							<Link to="/">
								<FaArrowLeft className="w-4 h-4" />
							</Link>
							<div className="flex flex-col">
								<p className="font-bold text-lg">{user?.fullName}</p>
								<span className="text-sm text-slate-500">
									{posts?.length} posts
								</span>
							</div>
						</div>

						{/* COVER IMG */}
						<div className="relative group/cover">
							<img
								src={coverImg || user?.coverImg}
								className="h-52 w-full object-cover"
								alt="cover image"
							/>
							{isMyProfile && (
								<div
									className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-300 group-active/cover:scale-50"
									onClick={() => coverImgRef.current.click()}
								>
									<MdEdit className="w-5 h-5 text-white" />
								</div>
							)}

							<input
								type="file"
								hidden
								ref={coverImgRef}
								accept="image/*"
								onChange={(e) => handleImgChange(e, "coverImg")}
							/>
							<input
								type="file"
								hidden
								ref={profileImgRef}
								accept="image/*"
								onChange={(e) => handleImgChange(e, "profileImg")}
							/>
							{/* USER AVATAR */}
							<div className="avatar absolute -bottom-16 left-4">
								<div className="w-32 rounded-full relative group/avatar">
									<img
										src={profileImg || user?.profileImg}
										key={user?.profileImg}
									/>
									<div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
										{isMyProfile && (
											<MdEdit
												className="w-4 h-4 text-white"
												onClick={() => profileImgRef.current.click()}
											/>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end px-4 mt-5 ">
							{isMyProfile && <EditProfileModal authUser={authUser} />}

							{!isMyProfile && (
								<button
									className="btn btn-outline rounded-full btn-sm"
									onClick={followUnfollowHandler}
								>
									{isPendingFollow && <LoadingSpinner size="sm" />}
									{!isPendingFollow && (isFollowing ? "Unfollow" : "Follow")}
								</button>
							)}
							{(coverImg || profileImg) && (
								<button
									className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
									onClick={handleUpdateProfile}
								>
									{isUpdatingProfile ? "Updating..." : "Update"}
								</button>
							)}
						</div>

						<div className="flex flex-col gap-4 mt-14 px-4">
							<div className="flex flex-col">
								<span className="font-bold text-lg">{user?.fullName}</span>
								<span className="text-sm text-slate-500">
									@{user?.username}
								</span>
								<span className="text-sm my-1">{user?.bio}</span>
							</div>

							<div className="flex gap-2 flex-wrap ">
								{user?.link && (
									<div
										className="flex gap-1 items-center "
										onClick={() => {
											// Validate and format the URL
											const formattedLink = /^https?:\/\//i.test(user?.link)
											  ? user?.link
											  : `https://${user?.link}`;
											  
											window.open(formattedLink, '_blank');
										  }}
									>
										<>
											<FaLink className="w-3 h-3 text-slate-500" />

											{user?.link}
										</>
									</div>
								)}
								<div className="flex gap-2 items-center">
									<IoCalendarOutline className="w-4 h-4 text-slate-500" />
									<span className="text-sm text-slate-500">
										{formatMemberSinceDate(user?.createdAt)}
									</span>
								</div>
							</div>
							<div className="flex gap-2">
								<div
									className="flex gap-1 items-center cursor-pointer hover:text-blue-600 active:text-blue-600"
									onClick={() =>
										document.getElementById("following-modal").showModal()
									}
								>
									<span className="font-bold text-xs">
										{user.following?.length}
									</span>
									<span className="text-slate-500 text-xs hover:text-blue-600 active:text-blue-600">
										Following
									</span>
								</div>
								<div
									className="flex gap-1 items-center cursor-pointer hover:text-blue-600 active:text-blue-600"
									onClick={() =>
										document.getElementById("followers-modal").showModal()
									}
								>
									<span className="font-bold text-xs ">
										{user.followers?.length}
									</span>
									<span className="text-slate-500 text-xs hover:text-blue-600 active:text-blue-600">
										Followers
									</span>
								</div>
							</div>
						</div>
						<div className="flex w-full border-b border-gray-700 mt-4">
							<div
								className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
								onClick={() => setFeedType("posts")}
							>
								Posts
								{feedType === "posts" && (
									<div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
								)}
							</div>
							<div
								className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
								onClick={() => setFeedType("likes")}
							>
								Likes
								{feedType === "likes" && (
									<div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
								)}
							</div>
						</div>
					</div>
				)}

				<Posts feedType={feedType} userId={user?._id} />
			</div>
		</div>
	);
};
export default ProfilePage;
