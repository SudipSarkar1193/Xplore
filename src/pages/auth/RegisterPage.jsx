import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "react-hot-toast";
import XSvg from "../../../src/components/svgs/X.jsx";
import { backendServer } from "../../BackendServer.js";
import {
	MdOutlineMail,
	MdPassword,
	MdDriveFileRenameOutline,
} from "react-icons/md";
import { FaUser } from "react-icons/fa";

const RegisterPage = () => {
	const [isRegistered, setIsRegistered] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const {
		mutate: signup,
		isError,
		isPending,
	} = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			try {
				const res = await fetch(`${backendServer}/api/v1/auth/signup`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ fullName, username, email, password }),
				});

				const resData = await res.json();

				if (!res.ok)
					throw new Error(resData.message || "Failed to create account");

				return { resData, username };
			} catch (error) {
				throw error;
			}
		},
		onSuccess: ({ resData, username }) => {
			toast.success(resData.message);
			if (resData.data.user.username !== username) {
				toast.success(`Only letters, numbers, and underscores are allowed`, {
					duration: 5000,
				});
				toast.success(`Your username: ${resData.data.user.username}`, {
					duration: 8000,
				});
			}

			setIsRegistered(true);
			setShowModal(true);
		},
		onError: (error) => {
			console.error(error);
			toast.error(error.message);
		},
	});

	if (isRegistered) {
		if (!showModal) return <Navigate to="/" />;
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-svh px-10 overflow-x-hidden overflow-y-hidden">
			{/* Custom Modal */}
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="absolute inset-0 bg-black opacity-75"></div>
					<div className="relative bg-black text-white p-6 rounded-lg shadow-lg z-10 max-w-sm w-full">
						<h3 className="text-2xl font-bold mb-4">
							Registration Successful ✅
						</h3>
						<p className="mb-6 text-lg">
							Your registration was completed successfully.
							<span className="font-semibold">
								Please check your inbox for a verification email.
							</span>
							<br />
							<br />
							<span className="text-pretty font-semibold text-red-600 text-xl underline">
								Note :
							</span>
							<br />
							If you don’t receive the email within a few minutes,
							<span className="text-pretty text-info-content animate-pulse">
								please check your spam folder as well.
							</span>
							<br />
							<br />
							Ensure that the email address you provided is correct if you don’t
							receive the email..
						</p>
						<button
							className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
							onClick={() => setShowModal(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}

			<div className="flex-1 hidden lg:flex items-center justify-center ">
				<XSvg className=" lg:w-2/3  fill-white svg-container hover:animate-bounce active:animate-bounce container" />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center container ">
				<form
					className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
					onSubmit={handleSubmit}
				>
					<div className="flex items-center justify-around">
						<h1 className="text-2xl font-extrabold text-white">Join today.</h1>
						<XSvg className="w-28 lg:hidden fill-white inline-block svg-container hover:animate-bounce active:animate-bounce container" />
					</div>

					<label className="input input-bordered rounded flex items-center gap-2">
						<MdOutlineMail />
						<input
							type="email"
							className="grow"
							placeholder="Email"
							name="email"
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className="flex gap-4 flex-wrap">
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<FaUser />
							<input
								type="text"
								className="grow"
								placeholder="Username"
								name="username"
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<MdDriveFileRenameOutline />
							<input
								type="text"
								className="grow"
								placeholder="Full Name"
								name="fullName"
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdPassword />
						<input
							type="password"
							className="grow"
							placeholder="Password"
							name="password"
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<p className="text-white text-md text-pretty text-center">
						You can add your Profile Picture and Cover Image later after you
						sign in😀
					</p>
					<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black">
						{isPending ? "Signing up..." : "Sign up"}
					</button>
					{isError && <p className="text-red-500">Something went wrong</p>}
				</form>
				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg">Already have an account?</p>
					<Link to="/login">
						<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black">
							Sign in
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
