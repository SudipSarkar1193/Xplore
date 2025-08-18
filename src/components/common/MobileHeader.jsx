import React from "react";
import XSvg from "../svgs/X";
import { FaBars, FaSearch } from "react-icons/fa";

const MobileHeader = ({ onMenuClick, onSearchClick }) => {
	return (
		<header className="flex lg:hidden justify-between items-center h-14 p-4 border-b border-gray-700 bg-black fixed top-0 left-0 w-full z-20">
			<button
				onClick={onMenuClick}
				className="p-2 rounded-full hover:bg-gray-800 transition-colors"
				aria-label="Open sidebar"
			>
				<FaBars size={20} />
			</button>
			<div className="flex-1 text-center">
				<XSvg className="w-8 h-8 fill-white mx-auto hover:animate-bounce active:animate-bounce" />
			</div>
			<button
				onClick={onSearchClick}
				className="p-2 rounded-full hover:bg-gray-800 transition-colors"
				aria-label="Open search"
			>
				<FaSearch size={20} />
			</button>
		</header>
	);
};

export default MobileHeader;