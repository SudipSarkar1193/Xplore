import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

const PostBody = ({ content, imageUrls }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	if (!imageUrls || imageUrls.length === 0) {
		return (
			<div className="flex flex-col gap-3 overflow-hidden mb-3">
				<p className="whitespace-pre-wrap open-sans-medium">{content}</p>
			</div>
		);
	}

	const openModal = (e, index) => {
		e.stopPropagation();
		setSelectedImageIndex(index);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const showNextImage = (e) => {
		e.stopPropagation();
		setSelectedImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
	};

	const showPrevImage = (e) => {
		e.stopPropagation();
		setSelectedImageIndex(
			(prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length
		);
	};

	const count = imageUrls.length;

	const renderSingleImage = () => (
		<img
			src={imageUrls[0]}
			className="w-full max-h-[600px] object-contain rounded-lg border border-gray-700 cursor-pointer"
			alt="Post image"
			onClick={(e) => openModal(e, 0)}
		/>
	);

	const renderTwoImages = () => (
		<div className="grid grid-cols-2 gap-2">
			{imageUrls.map((url, index) => (
				<div key={index} className="aspect-w-1 aspect-h-1">
					<img
						src={url}
						className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
						alt={`Post image ${index + 1}`}
						onClick={(e) => openModal(e, index)}
					/>
				</div>
			))}
		</div>
	);

	const renderThreeImages = () => (
		<div className="grid grid-cols-2 gap-2">
			<div className="aspect-w-1 aspect-h-2">
				<img
					src={imageUrls[0]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 1"
					onClick={(e) => openModal(e, 0)}
				/>
			</div>
			<div className="grid grid-rows-2 gap-2">
				{imageUrls.slice(1, 3).map((url, index) => (
					<div key={index} className="aspect-w-1 aspect-h-1">
						<img
							src={url}
							className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
							alt={`Post image ${index + 2}`}
							onClick={(e) => openModal(e, index + 1)}
						/>
					</div>
				))}
			</div>
		</div>
	);

	const renderFourOrMoreImages = () => (
		<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
			<div className="aspect-w-1 aspect-h-2">
				<img
					src={imageUrls[0]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 1"
					onClick={(e) => openModal(e, 0)}
				/>
			</div>
			{imageUrls.slice(1, 3).map((url, index) => (
				<div key={index} className="aspect-w-1 aspect-h-1">
					<img
						src={url}
						className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
						alt={`Post image ${index + 2}`}
						onClick={(e) => openModal(e, index + 1)}
					/>
				</div>
			))}
			<div className="relative aspect-w-1 aspect-h-1">
				<img
					src={imageUrls[3]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 4"
					onClick={(e) => openModal(e, 3)}
				/>
				{count > 4 && (
					<div
						className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center cursor-pointer"
						onClick={(e) => openModal(e, 3)}
					>
						<span className="text-white text-xl font-bold">+{count - 4}</span>
					</div>
				)}
			</div>
		</div>
	);

	const renderImageGallery = () => {
		if (count === 1) return renderSingleImage();
		if (count === 2) return renderTwoImages();
		if (count === 3) return renderThreeImages();
		return renderFourOrMoreImages();
	};

	return (
		<div className="flex flex-col gap-3 overflow-hidden mb-3 ">
			<p className="whitespace-pre-wrap open-sans-medium ">{content}</p>
			{renderImageGallery()}

			{isModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
					onClick={closeModal}
				>
					<button
						className="absolute top-4 right-4 text-white text-2xl"
						onClick={closeModal}
					>
						<FaTimes />
					</button>
					<img
						src={imageUrls[selectedImageIndex]}
						className="max-w-full max-h-full object-contain"
						alt="Full screen view"
					/>
					{imageUrls.length > 1 && (
						<>
							<button
								className="absolute left-4 text-white text-2xl"
								onClick={showPrevImage}
							>
								<FaArrowLeft />
							</button>
							<button
								className="absolute right-4 text-white text-2xl"
								onClick={showNextImage}
							>
								<FaArrowRight />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default PostBody;