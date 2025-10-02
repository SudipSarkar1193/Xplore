import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import { RiUserFollowFill, RiDeleteBin6Fill } from "react-icons/ri";
import { FaHeart, FaComment } from "react-icons/fa";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext";

const NotificationPage = () => {
	const { authToken, authUser, refreshUser, refetchUnreadCount } =
		useAuthContext();
	const queryClient = useQueryClient();

	const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
		authUser?.emailNotificationsEnabled || true
	);

	// Update local state when authUser changes
	useEffect(() => {
		if (authUser?.emailNotificationsEnabled !== undefined) {
			setEmailNotificationsEnabled(authUser.emailNotificationsEnabled);
		}
	}, [authUser]);

	const { data, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/v1/notifications`, {
					headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Something went wrong");
				return data.content;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		enabled: !!authToken,
		onSuccess: () => {
			// When notifications are successfully fetched, refetch the unread count.
			// The backend marks them as read, so the count should now be 0.
			refetchUnreadCount();
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				// Delete all notifications
				const res = await fetch(`${backendServer}/api/v1/notifications`, {
					method: "DELETE",
					headers: { Authorization: `Bearer ${authToken}` },
				});
				if (!res.ok) throw new Error("Something went wrong");
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Mutation to toggle email notifications
	const { mutate: toggleEmailNotifications, isPending: isToggling } =
		useMutation({
			mutationFn: async (enabled) => {
				try {
					const res = await fetch(
						`${backendServer}/api/users/me/notification-settings`,
						{
							method: "PUT",
							headers: {
								Authorization: `Bearer ${authToken}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ enabled }),
						}
					);
					const data = await res.json();
					if (!res.ok) throw new Error(data.message || "Something went wrong");
					return data;
				} catch (error) {
					throw new Error(error.message);
				}
			},
			onSuccess: async (data, enabled) => {
				toast.success(
					`Email notifications ${enabled ? "enabled" : "disabled"}`
				);
				setEmailNotificationsEnabled(enabled);

				// Refresh the authUser data to keep it in sync
				await refreshUser();
			},
			onError: (error) => {
				toast.error(error.message);
				// Revert the toggle state on error
				setEmailNotificationsEnabled(!emailNotificationsEnabled);
			},
		});

	const handleEmailToggle = () => {
		const newState = !emailNotificationsEnabled;
		setEmailNotificationsEnabled(newState); // Optimistic update
		toggleEmailNotifications(newState);
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "NEW_FOLLOWER":
				return <RiUserFollowFill className="w-7 h-7 text-emerald-600" />;
			case "POST_LIKE":
				return <FaHeart className="w-7 h-7 text-red-500" />;
			case "POST_COMMENT":
				return <FaComment className="w-7 h-7 text-sky-600" />;
			default:
				return null;
		}
	};

	return (
		<>
			<div className="w-full border-l border-r border-gray-700 min-h-screen overflow-y-auto">
				<div className="flex justify-between items-center p-4 border-b border-gray-700">
					<p className="font-bold">Notifications</p>
					<div className="dropdown dropdown-end">
						<div tabIndex={0} role="button" className="m-1">
							<IoSettingsOutline className="w-4 cursor-pointer" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64"
						>
							<li>
								<div className="flex items-center justify-between p-2">
									<span className="text-sm">
										<a onClick={deleteNotifications}>
											Delete all notifications
										</a>
									</span>
									<RiDeleteBin6Fill
										className="w-5 h-5 text-red-600 cursor-pointer"
										onClick={deleteNotifications}
									/>
								</div>
							</li>
							{/* <li className="menu-title">
								<span>Email Settings</span>
							</li> */}
							<li onClick={(e) => e.stopPropagation()}>
								<div className="flex items-center justify-between p-2">
									<span className="text-sm">Email notifications</span>
									<input
										type="checkbox"
										className="toggle toggle-sm rounded-2xl checked:bg-blue-500 checked:border-blue-500"
										checked={emailNotificationsEnabled}
										onChange={handleEmailToggle}
										disabled={isToggling}
									/>
								</div>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className="flex justify-center h-full items-center">
						<LoadingSpinner size="lg" />
					</div>
				)}
				{data?.length === 0 && (
					<div className="text-center p-4 font-bold">No notifications 🤔</div>
				)}
				{data?.map((notification) => (
					<div
						className="border-b border-gray-700"
						key={notification.notificationUuid}
					>
						<div className="flex gap-4 p-4">
							{getNotificationIcon(notification.type)}
							<Link to={`/profile/${notification.senderUsername}`}>
								<div className="avatar mr-2">
									<div className="w-8 rounded-full">
										<img
											src={
												notification.senderProfilePictureUrl ||
												"/avatar-placeholder.png"
											}
										/>
									</div>
								</div>
							</Link>
							<div className="">
								<Link to={`/profile/${notification.senderUsername}`}>
									<span className="font-bold">
										@{notification.senderUsername}
									</span>
								</Link>
								{" " + notification.message.split(" ").slice(1).join(" ")}
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;
