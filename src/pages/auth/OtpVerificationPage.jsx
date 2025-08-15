import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
	LuMail,
	LuShield,
	LuClock,
	LuArrowLeft,
	LuRefreshCw,
} from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";

const LoadingSpinner = () => (
	<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

const Timer = React.forwardRef(({ onTimerEnd }, ref) => {
	const [time, setTime] = useState(300); // 5 minutes
    const navigate = useNavigate();

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTime((prev) => {
				if (prev <= 1) {
					onTimerEnd();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [onTimerEnd]);

	React.useImperativeHandle(ref, () => ({
		restartTimer: () => setTime(300),
	}));

	const minutes = Math.floor(time / 60);
	const seconds = time % 60;

	return (
		<span className="font-mono font-semibold text-green-400">
			{minutes.toString().padStart(2, "0")}:
			{seconds.toString().padStart(2, "0")}
		</span>
	);
});

const LoaderWithText = ({ text }) => (
	<div className="flex items-center gap-2">
		<LoadingSpinner />
		<span>{text}</span>
	</div>
);

const OtpVerificationPage = () => {
	const timerRef = useRef();
	const location = useLocation();
	const { email } = location.state || {};

	const [otp, setOtp] = useState(new Array(6).fill(""));
	const [isResending, setIsResending] = useState(false);
	const inputRefs = useRef([]);

	const restartTheTimer = () => {
		if (timerRef.current) {
			timerRef.current.restartTimer();
		}
	};

	const handleTimerEnd = () => {
		toast.error("OOPS 😓 Time out - Please try registering again");
	};

	const { mutate: verifyOtp, isPending: isVerifying } = {
		mutate: async () => {
			try {
				toast.loading(`Verifying OTP: ${otp.join("")} for ${email}`);
			} catch (error) {
				toast.error(error.message);
			}
		},
		isPending: false,
	};

	const { mutate: resendOtp } = {
		mutate: () => {
			setIsResending(true);
			setTimeout(() => {
				setIsResending(false);
				toast.success("OTP resent successfully!");
				restartTheTimer();
			}, 1000);
		},
	};

	const handleInputChange = (index, value) => {
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value && index < otp.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerifyOtp = (e) => {
		e.preventDefault();
		const otpString = otp.join("");
		if (otpString.length === otp.length) {
			verifyOtp();
		} else {
			toast.error(`Please enter a valid ${otp.length}-digit OTP`);
		}
	};

	const handleGoBack = () => {
		navigate("/signup");
	};

	return (
		<div className="w-screen h-screen flex items-center justify-center">
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 text-white">
				<div className="w-full max-w-md">
					{/* Back Button */}
					<button
						onClick={handleGoBack}
						className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors duration-200"
					>
						<LuArrowLeft size={20} />
						<span>Back to Register</span>
					</button>

					{/* Main Card */}
					<div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
						{/* Header */}
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
								<LuShield className="w-8 h-8 text-green-400" />
							</div>
							<h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
							<p className="text-gray-400">
								We've sent a 6-digit verification code to
							</p>
							<div className="flex items-center justify-center gap-2 mt-2">
								<LuMail className="w-4 h-4 text-green-400" />
								<span className="font-semibold">{email}</span>
							</div>
						</div>

						{/* OTP Input Section */}
						<form onSubmit={handleVerifyOtp} className="space-y-6">
							<div className="flex justify-center gap-3">
								{otp.map((digit, index) => (
									<input
										key={index}
										ref={(el) => (inputRefs.current[index] = el)}
										type="text"
										value={digit}
										onChange={(e) => handleInputChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										maxLength={1}
										className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-600 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-700 outline-none transition-all duration-200 bg-gray-900 text-white"
										placeholder="•"
									/>
								))}
							</div>

							{/* Timer */}
							<div className="flex items-center justify-center gap-2 text-sm text-gray-400">
								<LuClock className="w-4 h-4" />
								<span>Code expires in</span>
								<Timer ref={timerRef} onTimerEnd={handleTimerEnd} />
							</div>

							{/* Verify Button */}
							<button
								type="submit"
								disabled={isVerifying || otp.some((digit) => !digit)}
								className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-900/50"
							>
								{isVerifying ? (
									<LoaderWithText text="Verifying..." />
								) : (
									"Verify Email"
								)}
							</button>
						</form>

						{/* Resend Section */}
						<div className="mt-8 text-center">
							<p className="text-gray-400 text-sm mb-3">
								Didn't receive the code?
							</p>
							<button
								onClick={() => resendOtp()}
								disabled={isResending}
								className="inline-flex items-center gap-2 text-green-400 font-medium hover:text-green-300 transition-colors duration-200 disabled:opacity-50"
							>
								<LuRefreshCw
									className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
								/>
								{isResending ? (
									<LoaderWithText text="Resending..." />
								) : (
									"Resend Code"
								)}
							</button>
						</div>

						{/* Help Text */}
						<div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
							Check your spam folder if you don't see the email in your inbox
						</div>
					</div>

					{/* Security Note */}
					<div className="mt-6 text-center text-xs text-gray-500">
						🔒 Your information is secure and encrypted
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtpVerificationPage;
