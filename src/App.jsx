import React, { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { SearchUser } from "./components/common/SearchUser";
import { useAuthContext } from "./context/AuthContext";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";

// Import the new MobileHeader component
import MobileHeader from "./components/common/MobileHeader";
import CreatePostModal from "./components/common/CreatePostModal";
import FloatingActionButton from "./components/common/FloatingActionButton";
import { usePostContext } from "./context/PostContext";
import { LoaderWithText } from "./components/common/LoaderWithText";
import { set } from "mongoose";

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
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const { isPosting } = usePostContext();

	const closeModal = () => {
		setIsSearchModalOpen(false);
		console.log("Closing search modal from App.jsx");
	};

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	);

	if (isLoading) {
		return <BackgroundPage showHeading={true} />;
	}

	return (
		<div className="flex max-w-screen mx-auto">
			<Toaster />
			<Suspense fallback={<StyledLoadingSpinner />}>
				{authUser ? (
					<>
						<MobileHeader
							onMenuClick={() => setIsSidebarOpen(true)}
							onSearchClick={() => setIsSearchModalOpen(true)}
						/>
						{isPosting && (
							<div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600/30 border-1 border-green-600 px-4 py-1 rounded-lg shadow-lg">
								<LoaderWithText
									text={"creating your post..."}
									textColor="green-500"
									spinnerColor="stroke-green-400"
								/>
							</div>
						)}
						<Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
						{/* Main content container */}
						<div className="flex flex-1 min-h-screen">
							{/* Main content area */}
							<main className="flex-1 min-w-0 pt-14 lg:pt-0 lg:ml-64 xl:ml-72 overflow-y-auto overflow-x-hidden ">
								<Routes>
									<Route path="/" element={<HomePage />} />
									<Route path="/login" element={<Navigate to="/" />} />
									<Route path="/signup" element={<Navigate to="/" />} />
									<Route path="/notifications" element={<NotificationPage />} />
									<Route path="/profile/:username" element={<ProfilePage />} />
									<Route path="/post/:postUuid" element={<PostPage />} />
									<Route path="/bookmarks" element={<BookmarkPage />} />
									<Route path="*" element={<Navigate to="/" />} />
								</Routes>
							</main>

							{/* Right Panel for desktop */}
							<aside className="hidden lg:block lg:w-[450px] flex-shrink-0">
								<div className="sticky top-0 h-screen overflow-y-auto no-scrollbar">
									<SearchUser closeModal={closeModal} />
								</div>
							</aside>
						</div>
						{/* Search Modal for mobile */}
						<dialog
							className={`modal ${isSearchModalOpen ? "modal-open" : ""}`}
						>
							<div className="modal-box">
								<button
									onClick={() => {
										setIsSearchModalOpen(false);
										console.log("Closing search modal", setIsSearchModalOpen);
									}}
									className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
								>
									✕
								</button>
								<SearchUser isModalMode={true} closeModal={closeModal} />
							</div>
						</dialog>
						<CreatePostModal />
						<FloatingActionButton />
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
