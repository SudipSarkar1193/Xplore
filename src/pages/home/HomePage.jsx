import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Posts from "../../components/common/Post/Posts";
import CreatePost from "./CreatePost";
import ShortsPage from "../shorts/ShortsPage";

const HomePage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Initialize state from location, defaulting to "forYou"
	const [feedType, setFeedType] = useState(
		location.state?.feedType || "forYou"
	);

	// Effect to update the feed type if the user navigates with state
	useEffect(() => {
		if (location.pathname === "/" && location.state?.feedType) {
			setFeedType(location.state.feedType);
		}
	}, [location.state, location.pathname]);

	const handleTabClick = (type) => {
		setFeedType(type);
		// Clear navigation state when clicking tabs directly on the page
		navigate(location.pathname, { replace: true, state: {} });
	};

	return (
		<div className="flex flex-col w-full">
			{/* Sticky Header */}
			<div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
				<div className="flex w-full border-b border-gray-700">
					<div
						className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						onClick={() => handleTabClick("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
						)}
					</div>
					<div
						className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						onClick={() => handleTabClick("shorts")}
					>
						Shorts
						{feedType === "shorts" && (
							<div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
						)}
					</div>
					<div
						className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						onClick={() => handleTabClick("following")}
					>
						Following
						{feedType === "following" && (
							<div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
						)}
					</div>
				</div>
			</div>

			{/* Feed Section */}

			{feedType === "shorts" ? <ShortsPage /> : <Posts feedType={feedType} />}
		</div>
	);
};
export default HomePage;
