import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import XSvg from "../../../src/components/svgs/X.jsx";
import { backendServer } from "../../BackendServer.js";
import {
	MdOutlineMail,
	MdPassword,
	MdDriveFileRenameOutline,
} from "react-icons/md";

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
	});

	const navigate = useNavigate();

	const {
		mutate: signup,
		isError,
		isPending,
	} = useMutation({
		mutationFn: async ({ email, password, firstName, lastName }) => {
			try {
				const res = await fetch(`${backendServer}/api/auth/register`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password, firstName, lastName }),
				});

				const resData = await res.json();

				if (!res.ok)
					throw new Error(resData.message || "Failed to create account");
				console.log("Registration successful:", resData);
				return resData;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("OTP sent to your email.");
			navigate("/verify-otp", { state: { email: formData.email } });
		},
		onError: (error) => {
			console.error(error);
			toast.error(error.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isPending) return;

		const { email, password, firstName, lastName } = formData;

		if (!email || !password || !firstName || !lastName) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
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
				<XSvg className="lg:w-2/3 fill-white svg-container hover:animate-bounce active:animate-bounce container" />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center container">
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
							<MdDriveFileRenameOutline />
							<input
								type="text"
								className="grow"
								placeholder="First Name"
								name="firstName"
								onChange={handleInputChange}
								value={formData.firstName}
							/>
						</label>
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<MdDriveFileRenameOutline />
							<input
								type="text"
								className="grow"
								placeholder="Last Name"
								name="lastName"
								onChange={handleInputChange}
								value={formData.lastName}
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
						sign in 😀
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
