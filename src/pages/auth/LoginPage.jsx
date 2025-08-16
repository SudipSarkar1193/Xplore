import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdPassword } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext"; 
import "../../components/common/Tilted.css";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		usernameOrEmail: "",
		password: "",
	});
	const [isPending, setIsPending] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	
	const { login } = useAuthContext(); // Getting the login function from context

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isPending) return;
		setIsPending(true);
		try {
			const res = await fetch(`${backendServer}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to log in");
			}
			login(data.accessToken); 
			toast.success("Login successful");
		} catch (error) {
			console.error(error.message);
			toast.error(error.message);
		} finally {
			setIsPending(false);
		}
	};

	// Google Sign-In logic  ... LATER

	return (
		<div className="max-w-screen-xl mx-auto flex h-svh px-10  overflow-x-hidden overflow-y-hidden lg:px-20">
			<div className="flex-1 hidden lg:flex items-center  justify-center">
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
						{isPending ? "Signing in..." : "Sign in"}
					</button>
				</form>
				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg">Don't have an account ?</p>
					<Link to="/signup">
						<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black">
							Sign up
						</button>
					</Link>
				</div>
				{/* <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg text-center">Or</p>
					<button className="btn rounded-full font-bold btn-outline w-full active:bg-white active:text-black">
						Sign in with <FcGoogle size={27} />
					</button>
				</div> */}
			</div>
		</div>
	);
};

export default LoginPage;