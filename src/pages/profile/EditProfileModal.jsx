import { useEffect, useState } from "react";
import useUpdateUserProfile from "../../custom_hooks/useUpdateProfile";

const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		fullName: "",
		bio: "",
	});

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				bio: authUser.bio || "",
			});
		}
	}, [authUser]);

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await updateProfile(formData);
		document.getElementById(`edit_profile_modal_${authUser.uuid}`).close();
	};

	return (
		<>
			<button
				className="btn btn-outline rounded-full btn-sm"
				onClick={() => document.getElementById(`edit_profile_modal_${authUser.uuid}`).showModal()}
			>
				Edit Profile
			</button>
			<dialog id={`edit_profile_modal_${authUser.uuid}`} className="modal">
				<div className="modal-box border rounded-md border-gray-700 shadow-md">
					<h3 className="font-bold text-lg my-3">Update Profile</h3>
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-2">
							<input
								type="text"
								placeholder="Full Name"
								className="flex-1 input border border-gray-700 rounded p-2 input-md"
								value={formData.fullName}
								name="fullName"
								onChange={handleInputChange}
							/>
							<textarea
								placeholder="Bio"
								className="flex-1 input border border-gray-700 rounded p-2 input-md h-24"
								value={formData.bio}
								name="bio"
								onChange={handleInputChange}
							/>
						</div>
						<button className="btn btn-primary rounded-full btn-sm text-white">
							{isUpdatingProfile ? "Updating..." : "Update"}
						</button>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button className="outline-none">close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;