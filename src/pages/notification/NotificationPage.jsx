import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaHeart, FaComment } from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext";

const NotificationPage = () => {
	const { authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				// The endpoint is paginated, but for simplicity, we're fetching the first page.
				const res = await fetch(`${backendServer}/api/v1/notifications`, {
					headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Something went wrong");
				return data.content; // Use the 'content' array from the paginated response
			} catch (error) {
				throw new Error(error.message);
			}
		},
		enabled: !!authToken,
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				// Assumes a new backend endpoint for deleting notifications
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

	const getNotificationIcon = (type) => {
		switch (type) {
			case "NEW_FOLLOWER":
				return <FaUser className="w-7 h-7 text-primary" />;
			case "POST_LIKE":
				return <FaHeart className="w-7 h-7 text-red-500" />;
			case "POST_COMMENT":
				return <FaComment className="w-7 h-7 text-gray-400" />;
			default:
				return null;
		}
	};
	
	return (
		<>
			<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen overflow-y-auto">
				<div className="flex justify-between items-center p-4 border-b border-gray-700">
					<p className="font-bold">Notifications</p>
					<div className="dropdown dropdown-end">
						<div tabIndex={0} role="button" className="m-1">
							<IoSettingsOutline className="w-4 cursor-pointer" />
						</div>
						<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
							<li><a onClick={deleteNotifications}>Delete all notifications</a></li>
						</ul>
					</div>
				</div>
				{isLoading && <div className="flex justify-center h-full items-center"><LoadingSpinner size="lg" /></div>}
				{data?.length === 0 && <div className="text-center p-4 font-bold">No notifications 🤔</div>}
				{data?.map((notification) => (
					<div className="border-b border-gray-700" key={notification.notificationUuid}>
						<div className="flex gap-4 p-4">
							{getNotificationIcon(notification.type)}
							<Link to={`/profile/${notification.senderUsername}`}>
								<div className="avatar mr-2">
									<div className="w-8 rounded-full">
										<img src={notification.senderProfilePictureUrl || "/avatar-placeholder.png"} />
									</div>
								</div>
							</Link>
							<div className="flex gap-1 items-center">
								<Link to={`/profile/${notification.senderUsername}`}>
									<span className="font-bold">@{notification.senderUsername}</span>
								</Link>
								{notification.message}
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;