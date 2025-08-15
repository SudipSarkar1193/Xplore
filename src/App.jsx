import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { SearchUser } from "./components/common/SearchUser";
import { useAuthContext } from "./context/AuthContext";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";

const ErrorPage = lazy(() => import("./pages/error/ErrorPage"));
const HomePage = lazy(() => import("./pages/home/HomePage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationPage = lazy(() =>
	import("./pages/notification/NotificationPage")
);
const BookmarkPage = lazy(() => import("./pages/profile/BookmarkPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const EmailVerifyPage = lazy(() => import("./pages/auth/EmailVerifyPage"));
const Sidebar = lazy(() => import("./components/common/Sidebar"));
const RightPanel = lazy(() => import("./components/common/RightPanel"));
const PostPage = lazy(() => import("./pages/post/PostPage")); 

const App = () => {
	// Using the authUser and isLoading state from the context
	const { authUser, isLoading } = useAuthContext();

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	);

	if (isLoading) {
		return <BackgroundPage showHeading={true} />;
	}

	return (
		<div className="flex justify-between max-w-6xl mx-auto">
			<Toaster />
			<Suspense fallback={<StyledLoadingSpinner />}>
				{authUser ? ( // if authUser exists i.e user is already autheticated
					<>
						<Sidebar />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/login" element={<Navigate to="/" />} />
							<Route path="/signup" element={<Navigate to="/" />} />
							<Route path="/notifications" element={<NotificationPage />} />
							<Route path="/profile/:username" element={<ProfilePage />} />
							<Route path="/post/:postUuid" element={<PostPage />} />

							{/* <Route path="/bookmarks" element={<BookmarkPage />} /> */}
							<Route path="*" element={<Navigate to="/" />} />
						</Routes>
						<SearchUser />
					</>
				) : (
					<>
						<BackgroundPage />
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<RegisterPage />} />
							<Route path="/verify-otp" element={<OtpVerificationPage />} />
							<Route path="*" element={<Navigate to="/login" />} />
						</Routes>
					</>
				)}
			</Suspense>
		</div>
	);
};

export default App;
