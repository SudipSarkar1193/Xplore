import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();
	const { authToken, logout } = useAuthContext();
	console.log(
		"useUpdateUserProfile hook initialized with authToken:",
		authToken
	);

	console.log("Hook init token:", authToken);
	const {
		mutateAsync: updateProfile,
		isPending: isUpdatingProfile,
		isSuccess,
	} = useMutation({
		mutationFn: async (formData) => {
			try {
				const { oldUsername, ...dataToSend } = formData;

				console.log("-------------->>>>>>>>:", dataToSend);

				const res = await fetch(`${backendServer}/api/users/update`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify(dataToSend),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: (data, variables) => {
			
			toast.success("Profile updated successfully");

			// if username has changed
			if (
				variables.oldUsername &&
				variables.username !== variables.oldUsername
			) {
				toast.loading(
					"Username changed. Logging you out to refresh session...",
					{
						duration: 4000,
					}
				);
				setTimeout(() => {
					logout();
				}, 4000);
			} else {
				Promise.all([
					queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
					queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
					queryClient.invalidateQueries({ queryKey: ["posts"] }),
				]);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile, isSuccess };
};

export default useUpdateUserProfile;
