import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "../../context/ModalContext";

const FloatingActionButton = () => {
	const { openModal } = useModal();

	return (
		<button
			onClick={openModal}
			className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-40"
		>
			<FaPlus size={24} />
		</button>
	);
};

export default FloatingActionButton;