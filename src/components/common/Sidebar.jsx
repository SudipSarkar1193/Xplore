import React, { useState } from "react";
import { Link } from "react-router-dom";
import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { useAuthContext } from "../../context/AuthContext";
import { SearchUser } from "./SearchUser";

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const { authUser, logout } = useAuthContext();

	const handleLogout = (e) => {
		e.preventDefault();
		logout();
		setIsOpen(false);
	};

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	const openSearchModal = () => {
		setIsOpen(false); // Close the sidebar first
		setIsSearchModalOpen(true);
	};

	return (
		<>
			{/* Hamburger Menu Icon to open the sidebar */}
			<div className="fixed top-4 left-4 z-30">
				<button
					onClick={() => setIsOpen(true)}
					className="p-2 rounded-full bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors"
					aria-label="Open sidebar"
				>
					<FaBars size={20} />
				</button>
			</div>

			{/* Backdrop Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar Panel */}
			<aside
				className={`fixed top-0 left-0 h-full bg-black z-50 transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-700 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    w-64 md:w-72`}
			>
				{/* Sidebar Header with Logo and Close Button */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<Link to="/" onClick={handleLinkClick}>
						<XSvg className="w-8 h-8 fill-white" />
					</Link>
					<button
						onClick={() => setIsOpen(false)}
						className="p-2 rounded-full hover:bg-gray-800"
						aria-label="Close sidebar"
					>
						<FaTimes size={20} />
					</button>
				</div>

				{/* Navigation Links */}
				<nav className="flex-grow p-4">
					<ul className="flex flex-col gap-3">
						<li>
							<Link
								to="/"
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
								onClick={handleLinkClick}
							>
								<MdHomeFilled className="w-8 h-8" />
								<span className="text-lg">Home</span>
							</Link>
						</li>
						<li className="md:hidden"> {/* Hide on medium screens and up */}
							<button
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
								onClick={openSearchModal}
							>
								<FaSearch className="w-6 h-6" />
								<span className="text-lg">Search</span>
							</button>
						</li>
						<li>
							<Link
								to="/notifications"
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
								onClick={handleLinkClick}
							>
								<IoNotifications className="w-6 h-6" />
								<span className="text-lg">Notifications</span>
							</Link>
						</li>
						<li>
							<Link
								to={`/profile/${authUser?.username}`}
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
								onClick={handleLinkClick}
							>
								<FaUser className="w-6 h-6" />
								<span className="text-lg">Profile</span>
							</Link>
						</li>
					</ul>
				</nav>

				{/* User Profile section at the bottom */}
				{authUser && (
					<div className="p-4 border-t border-gray-700">
						<Link
							to={`/profile/${authUser.username}`}
							className="flex gap-2 items-center transition-all duration-300 hover:bg-secondary py-2 px-4 rounded-full"
							onClick={handleLinkClick}
						>
							<div className="avatar">
								<div className="w-8 rounded-full">
									<img
										src={authUser.profilePictureUrl || "/avatar-placeholder.png"}
										alt="Profile"
									/>
								</div>
							</div>
							<div className="flex justify-between flex-1 items-center">
								<div>
									<p className="text-white font-bold text-sm w-28 truncate">
										{authUser.username}
									</p>
									<p className="text-slate-500 text-sm">@{authUser.username}</p>
								</div>
								<BiLogOut
									className="w-5 h-5 cursor-pointer hover:text-red-500"
									onClick={handleLogout}
								/>
							</div>
						</Link>
					</div>
				)}
			</aside>

			{/* Search Modal */}
			<dialog className={`modal ${isSearchModalOpen ? "modal-open" : ""}`}>
				<div className="modal-box">
					<button
						onClick={() => setIsSearchModalOpen(false)}
						className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>
						✕
					</button>
					<SearchUser show={true} isModalMode={true} />
				</div>
			</dialog>
		</>
	);
};

export default Sidebar;