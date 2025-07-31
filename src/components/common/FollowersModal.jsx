import React from 'react'
import { FaArrowLeft } from "react-icons/fa6";
import { FaTimesCircle } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import UserListItem from './UserListItem';


export const FollowersModal = ({ isOpen, onClose, users, title, isLoading }) => {
    if (!isOpen) return null;

	//console.log("FollowersModal users:", users);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <FaTimesCircle className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : users && users.length > 0 ? (
                        <div className="divide-y divide-gray-700">
                            {/* Render the new self-contained component */}
                            {users.map((user) => (
                                <UserListItem key={user.uuid} user={user} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            No {title.toLowerCase()} to show
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
