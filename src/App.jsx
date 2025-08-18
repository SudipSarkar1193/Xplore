import React, { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { SearchUser } from "./components/common/SearchUser";
import { useAuthContext } from "./context/AuthContext";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";
import { FaBars } from "react-icons/fa";

const ErrorPage = lazy(() => import("./pages/error/ErrorPage"));
const HomePage = lazy(() => import("./pages/home/HomePage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationPage = lazy(() =>
	import("./pages/notification/NotificationPage")
);
const BookmarkPage = lazy(() => import("./pages/profile/BookmarkPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const Sidebar = lazy(() => import("./components/common/Sidebar"));
const RightPanel = lazy(() => import("./components/common/RightPanel"));
const PostPage = lazy(() => import("./pages/post/PostPage"));

const App = () => {
	const { authUser, isLoading } = useAuthContext();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	);

	if (isLoading) {
		return <BackgroundPage showHeading={true} />;
	}

	return (
		<div className="flex max-w-screen mx-auto overflow-x-hidden no-scrollbar overflow-y-auto">
			<Toaster />
			<Suspense fallback={<StyledLoadingSpinner />}>
				{authUser ? ( // if user is authenticated
					<>
						<div className="fixed top-4 left-4 z-30 h-10 w-10 ">
							<button
								onClick={() => setIsSidebarOpen(true)}
								className="p-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors"
								aria-label="Open sidebar"
							>
								<FaBars size={20} />
							</button>
						</div>
						<Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

						<main className="flex-grow min-w-0 ml-16 md:ml-20">
							<div className="">
								<Routes>
									<Route path="/" element={<HomePage />} />
									<Route path="/login" element={<Navigate to="/" />} />
									<Route path="/signup" element={<Navigate to="/" />} />
									<Route path="/notifications" element={<NotificationPage />} />
									<Route path="/profile/:username" element={<ProfilePage />} />
									<Route path="/post/:postUuid" element={<PostPage />} />
									<Route path="*" element={<Navigate to="/" />} />
								</Routes>
							</div>
						</main>
						<SearchUser />
					</>
				) : (
					<div className="w-full">
						<BackgroundPage />
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<RegisterPage />} />
							<Route path="/verify-otp" element={<OtpVerificationPage />} />
							<Route path="*" element={<Navigate to="/login" />} />
						</Routes>
					</div>
				)}
			</Suspense>
		</div>
	);
};

export default App;