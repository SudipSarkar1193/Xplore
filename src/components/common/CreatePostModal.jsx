import React, { useState } from "react";
import { useModal } from "../../context/ModalContext";
import CreatePost from "../../pages/home/CreatePost";
import { FaTimes } from "react-icons/fa";
import CreatePostPage from "../../pages/home/CreatePostPage";

const CreatePostModal = () => {
	const { isModalOpen, closeModal } = useModal();
	const [scrollPosition, setScrollPosition] = useState(0);

	const handleScroll = (e) => {
		e.stopPropagation();
	};

	if (!isModalOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
			onScroll={handleScroll}
		>
			<div className="bg-black border-2 border-gray-700 rounded-2xl w-full max-w-2xl mx-4  relative">
				<button
					onClick={closeModal}
					className="absolute top-4 right-4 text-white hover:text-gray-400"
				>
					<FaTimes size={24} />
				</button>
				<div className="p-4 mt-10">
					<CreatePostPage />
				</div>
			</div>
		</div>
	);
};

export default CreatePostModal;
