import React from "react";
import Posts from "../../components/common/Post/Posts";

const ShortsPage = () => {
	return (
		<div className="w-full h-full">
			<Posts feedType="shorts" />
		</div>
	);
};

export default ShortsPage;
