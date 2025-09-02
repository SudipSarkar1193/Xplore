import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";
import { useAuthContext } from "../context/AuthContext";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();
	const { authToken, logout } = useAuthContext();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
		useMutation({
			mutationFn: async ({ formData }) => {
				// Expect an object containing the FormData
				try {
					const res = await fetch(`${backendServer}/api/users/update`, {
						method: "PUT",
						headers: {
							// No 'Content-Type' header, browser sets it for multipart
							Authorization: `Bearer ${authToken}`,
						},
						body: formData,
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

				if (
					variables.oldUsername &&
					variables.newUsername !== variables.oldUsername
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
						queryClient.invalidateQueries({ queryKey: ["authUser"] }),
					]);
				}
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
