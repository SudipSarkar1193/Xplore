// src/pages/auth/RegisterPage.jsx

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
		fullName: "",
	});

	const {
		mutate: signup,
		isError,
		isPending,
	} = useMutation({
		mutationFn: async ({ email, username, password, fullName }) => {
			try {
				const res = await fetch(`${backendServer}/api/auth/register`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, email, password, fullName }),
				});

				const resData = await res.json();

				if (!res.ok)
					throw new Error(resData.message || "Failed to create account");

				return resData;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: (resData) => {
			toast.success("Account created successfully. Please log in.");
			setIsRegistered(true);
		},
		onError: (error) => {
			console.error(error);
			toast.error(error.message);
		},
	});

	if (isRegistered) {
		return <Navigate to="/login" />;
	}

	const handleSubmit = (e) => {
		e.preventDefault();

		if (isPending) return;

		const { email, username, password, fullName } = formData;

		if (!email || !username || !password || !fullName) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}
		if (username.length < 3) {
			toast.error("Username must be at least 3 characters long");
			return;
		}
		if (!email.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}

		signup(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-svh px-10 overflow-x-hidden overflow-y-hidden">
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
