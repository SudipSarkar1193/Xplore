import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { set } from "mongoose";
import { json, Link, Navigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	signInWithRedirect,
} from "firebase/auth";
import { toast } from "react-hot-toast";
import { backendServer } from "../../BackendServer";
import { app } from "../../firebase";

import "../../components/common/Tilted.css";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		usernameOrEmail: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const {
		mutate: login,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: async ({ usernameOrEmail, password }) => {
			try {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				let username = null,
					email = null;
				if (emailRegex.test(usernameOrEmail)) {
					email = usernameOrEmail;
				} else {
					username = usernameOrEmail;
				}

				const res = await fetch(`${backendServer}/api/v1/auth/login`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ username, email, password }),
				});

				const jsonRes = await res.json();

				if (!res.ok) {
					throw new Error(jsonRes.message || "Failed to Log in");
				}
				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: (jsonRes) => {
			toast.success(jsonRes.message);
			queryClient.invalidateQueries({ queryKey: ["userAuth"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
			<Navigate to="/" />;
		},
		onError: (error) => {
			console.error(error.message);
			toast.error(error.message);
		},
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		if (isPending) return;
		e.preventDefault();
		login(formData);
	};

	const auth = getAuth(app);

	const provider = new GoogleAuthProvider();

	const {
		mutate: signInWithGoogle,
		isError: isGoogleErr,
		isPending: isGooglePending,
	} = useMutation({
		mutationFn: async (userInfo) => {
			const response = await fetch(`${backendServer}/api/v1/auth/google`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(userInfo),
			});

			if (!response.ok) {
				throw new Error("Failed to save user info");
			}

			const jsonRes = await response.json();
			return jsonRes;
		},
		onSuccess: (jsonRes) => {
			toast.success(jsonRes.message);
			queryClient.invalidateQueries({ queryKey: ["userAuth"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
			<Navigate to="/" />;
		},
		onError: (error) => {
			toast.error(`Error: ${error.message}`);
		},
	});

	const handleSignInWithFirebase = async () => {
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			let email = user.email;

			// User info, including name, email, etc.
			const userInfo = {
				name: user.displayName,
				email: user.email,
				profileImg: user.photoURL,
				firebaseId: user.uid,
			};

			// Perform the mutation to send userInfo to the backend
			signInWithGoogle(userInfo);
		} catch (error) {
			console.error("Error during sign-in:", error.message);
		}
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-svh px-10  overflow-x-hidden overflow-y-hidden lg:px-20">
			<div className="flex-1 hidden lg:flex items-center  justify-center">
				{" "}
				{/* Use flex-1 to allow a flex item to  grow and shrink as needed, ignoring its initial size: */}
				<XSvg className=" lg:w-2/3 fill-white  hover:animate-bounce active:animate-bounce container" />
			</div>

			<div className="flex-1 flex flex-col justify-center items-center  container ">
				<form
					className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col "
					onSubmit={handleSubmit}
				>
					<XSvg className="w-32 lg:hidden fill-white mx-auto svg-container  hover:animate-bounce active:animate-bounce container" />
					<h1 className="text-2xl font-extrabold text-white mx-auto ">
						Let's Go...
					</h1>

					<label className="input input-bordered w-full flex items-center gap-2">
						<MdOutlineMail />
						<FaUser />
						<input
							type="text"
							name="usernameOrEmail"
							autoComplete="username"
							className="grow"
							placeholder="Email or Username"
							value={formData.usernameOrEmail}
							onChange={handleInputChange}
						/>
					</label>

					<label className="input  input-bordered w-full flex items-center gap-2">
						<MdPassword />
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							placeholder="Password"
							autoComplete="new-password"
							className="grow"
							value={formData.password}
							onChange={handleInputChange}
						/>
						{showPassword ? (
							<FaEye onClick={() => setShowPassword(false)} />
						) : (
							<FaEyeSlash onClick={() => setShowPassword(true)} />
						)}
					</label>
					<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black ">
						Sign in
					</button>
					{isError && <p className="text-red-500">Something went wrong</p>}
				</form>

				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg">Don't have an account ?</p>
					<Link to="/signup">
						<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black">
							Sign up
						</button>
					</Link>
				</div>
				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg text-center">Or</p>
					<button
						className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black"
						onClick={handleSignInWithFirebase}
					>
						Sign in with <FcGoogle size={27} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
