import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: followUnfollow, isPending } = useMutation({
		mutationFn: async (userId, authUserId) => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/follow/${userId}`,
					{
						method: "POST",
						credentials: "include",
					}
				);

				const jsonRes = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}

				return { jsonRes, userId, authUserId };
			} catch (error) {
				throw error;
			}
		},
		onSuccess: async ({ jsonRes, userId, authUserId }) => {
			await queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
			await queryClient.invalidateQueries({ queryKey: ["followers", userId] });
			await queryClient.invalidateQueries({ queryKey: ["followings", userId] });
			await queryClient.invalidateQueries({
				queryKey: ["followers", authUserId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["followings", authUserId],
			});
			await queryClient.invalidateQueries({ queryKey: ["userAuth"] });
			await queryClient.invalidateQueries({
				queryKey: ["userProfile"],
			});

			toast.success(jsonRes.message, {
				position:"top-center", // You can also use "top-right" or "top-left" as per your preference
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { followUnfollow, isPending };
};

export default useFollow;
