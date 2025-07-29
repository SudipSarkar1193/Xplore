import { useState } from "react";
import Posts from "../../components/common/Posts";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const BookmarkPage = () => {
	const [length, setLength] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	
	return (
		<div className="overflow-x-hidden">
			<div className="w-screen h-16 bg-transparent text-white text-3xl text-opacity-80 text-center my-5 border-stone-500 border-b-2 italic">Bookmarked Posts</div>
			<Posts
				feedType={"bookmarks"}
				setIsLoading={setIsLoading}
				setLength={setLength}
			/>
		</div>
	);
};

export default BookmarkPage;
