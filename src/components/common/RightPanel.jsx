import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { backendServer } from "../../BackendServer.js";
import { useAuthContext } from "../../context/AuthContext.jsx";
import UserListItem from "./UserListItem.jsx";


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
				return []; 
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
		<div className="hidden lg:block my-4 w-full min-h-screen">
			<div className="px-4 rounded-md sticky top-2">
				<div className="flex flex-col gap-4 ">
					{suggestedUsers?.content.map((user) => (
						<UserListItem key={user.uuid} user={user} />
					))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
