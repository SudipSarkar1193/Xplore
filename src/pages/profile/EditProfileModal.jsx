import { useEffect, useState, useRef } from "react";
import useUpdateUserProfile from "../../custom_hooks/useUpdateProfile";
import { FaCamera } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";

const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		fullName: "",
		bio: "",
	});
	// State for profile picture
	const [profilePic, setProfilePic] = useState(null);
	const [profileImageFile, setProfileImageFile] = useState(null);
	const fileInputRef = useRef(null);

	const { authToken } = useAuthContext();

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	useEffect(() => {
		if (authUser) {
			setFormData({
				username: authUser.username || "",
				bio: authUser.bio || "",
			});
			setProfilePic(authUser.profilePictureUrl);
		}
	}, [authUser]);

	// HANDLERS ---

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// handler for image file change
	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfileImageFile(file); // Store the file object
			const reader = new FileReader();
			reader.onload = () => {
				setProfilePic(reader.result); // For preview
			};
			reader.readAsDataURL(file);
		}
	};

	// Submit handler
	const handleSubmit = async (e) => {
		e.preventDefault();
		const formDataObj = new FormData();
		// Append the DTO as a JSON string Blob
		formDataObj.append(
			"userProfileUpdateDTO",
			new Blob([JSON.stringify(formData)], { type: "application/json" })
		);
		if (profileImageFile) {
			formDataObj.append("profileImage", profileImageFile);
		}

		await updateProfile({
			formData: formDataObj,
			oldUsername: authUser.username,
			newUsername: formData.username,
		});
		document.getElementById(`edit_profile_modal_${authUser.uuid}`).close();
	};

	return (
		<>
			<button
				className="btn btn-outline rounded-full btn-sm"
				onClick={() =>
					document
						.getElementById(`edit_profile_modal_${authUser.uuid}`)
						.showModal()
				}
			>
				Edit Profile
			</button>
			<dialog id={`edit_profile_modal_${authUser.uuid}`} className="modal">
				<div className="modal-box border rounded-md border-gray-700 shadow-md">
					<h3 className="font-bold text-lg my-3">Update Profile</h3>
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex justify-center items-center">
							<div className="avatar relative group">
								<div className="w-24 rounded-full">
									<img
										src={profilePic || "/avatar-placeholder.png"}
										className="w-full h-full rounded-full object-cover"
									/>
								</div>
								<div
									className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={() => fileInputRef.current.click()}
								>
									<FaCamera className="w-6 h-6 text-white" />
								</div>
							</div>
							<input
								type="file"
								hidden
								ref={fileInputRef}
								onChange={handleImgChange}
								accept="image/*"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<input
								type="text"
								placeholder="Full Name"
								className="flex-1 input border border-gray-700 rounded p-2 input-md"
								value={formData.username}
								name="username"
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
						<button
							type="submit"
							className="btn btn-primary rounded-full btn-sm text-white"
							disabled={isUpdatingProfile}
						>
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
