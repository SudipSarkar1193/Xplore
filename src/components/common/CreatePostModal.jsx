// import React, { useState } from "react";
// import { useModal } from "../../context/ModalContext";
// import CreatePost from "../../pages/home/CreatePost";
// import { FaTimes } from "react-icons/fa";
// import CreatePostPage from "../../pages/home/CreatePostPage";

// const CreatePostModal = () => {
// 	const { isModalOpen, closeModal } = useModal();
// 	const [scrollPosition, setScrollPosition] = useState(0);

// 	// const handleScroll = (e) => {
// 	// 	e.stopPropagation();
// 	// };

// 	if (!isModalOpen) return null;

// 	return (
// 		<div
// 			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
// 			// onScroll={handleScroll}
// 		>
// 			<div className="bg-black border-2 border-gray-700 rounded-2xl w-full max-w-2xl mx-4  relative">
// 				<button
// 					onClick={closeModal}
// 					className="absolute top-4 right-4 text-white hover:text-gray-400"
// 				>
// 					<FaTimes size={24} />
// 				</button>
// 				<div className="p-4 mt-10">
// 					<CreatePostPage />
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default CreatePostModal;

import React, { useState, useEffect } from "react";
import { useModal } from "../../context/ModalContext";
import CreatePostPage from "../../pages/home/CreatePostPage";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import { FiImage, FiVideo } from "react-icons/fi";

const CreatePostModal = () => {
	const { isModalOpen, closeModal } = useModal();
	const [creationMode, setCreationMode] = useState(null); // 'post', 'short', or null

	// Reset the mode when the modal is closed
	useEffect(() => {
		if (!isModalOpen) {
			// Add a small delay to prevent seeing the mode reset before the modal closes
			setTimeout(() => {
				setCreationMode(null);
			}, 300);
		}
	}, [isModalOpen]);

	if (!isModalOpen) return null;

	const handleClose = () => {
		setCreationMode(null);
		closeModal();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
			<div className="bg-black border-2 border-gray-700 rounded-2xl w-full max-w-2xl mx-4 relative min-h-[300px]">
				{/* Header with Back and Close buttons */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					{creationMode && (
						<button
							onClick={() => setCreationMode(null)}
							className="text-white hover:text-gray-400"
						>
							<FaArrowLeft size={20} />
						</button>
					)}
					<div className="flex-1"></div> {/* Spacer */}
					<button
						onClick={handleClose}
						className="text-white hover:text-gray-400"
					>
						<FaTimes size={24} />
					</button>
				</div>

				{/* Conditional Content */}
				<div className="p-4">
					{!creationMode ? (
						// Step 1: Show the choice buttons
						<div className="flex flex-col items-center justify-center gap-6 py-10">
							<h2 className="text-2xl font-bold mb-4">
								What do you want to create?
							</h2>
							<div className="flex gap-8">
								<button
									onClick={() => setCreationMode("post")}
									className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
								>
									<FiImage size={40} className="text-sky-400" />
									<span className="font-semibold">Create Post</span>
								</button>
								<button
									onClick={() => setCreationMode("short")}
									className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
								>
									<FiVideo size={40} className="text-purple-400" />
									<span className="font-semibold">Create Short</span>
								</button>
							</div>
						</div>
					) : (
						// Step 2: Render the creation form with the selected mode
						<CreatePostPage mode={creationMode} closeEntireModal={closeModal} />
					)}
				</div>
			</div>
		</div>
	);
};

export default CreatePostModal;
