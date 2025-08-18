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
		<div className="grid grid-cols-2 gap-2 h-72">
			{imageUrls.map((url, index) => (
				<div key={index} className="h-full">
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
		<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
			<div className="col-span-1 row-span-2 h-full">
				<img
					src={imageUrls[0]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 1"
					onClick={(e) => openModal(e, 0)}
				/>
			</div>
			<div className="col-span-1 row-span-1 h-full">
				<img
					src={imageUrls[1]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 2"
					onClick={(e) => openModal(e, 1)}
				/>
			</div>
			<div className="col-span-1 row-span-1 h-full">
				<img
					src={imageUrls[2]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 3"
					onClick={(e) => openModal(e, 2)}
				/>
			</div>
		</div>
	);

	const renderFourImages = () => (
		<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
			{imageUrls.slice(0, 4).map((url, index) => (
				<div key={index} className="h-full">
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

	const renderFiveOrMoreImages = () => (
		<div className="grid grid-cols-3 grid-rows-2 gap-2 h-80">
			<div className="col-span-2 row-span-2 h-full">
				<img
					src={imageUrls[0]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 1"
					onClick={(e) => openModal(e, 0)}
				/>
			</div>
			<div className="col-span-1 row-span-1 h-full">
				<img
					src={imageUrls[1]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 2"
					onClick={(e) => openModal(e, 1)}
				/>
			</div>
			<div className="col-span-1 row-span-1 relative h-full">
				<img
					src={imageUrls[2]}
					className="w-full h-full object-cover rounded-lg border border-gray-700 cursor-pointer"
					alt="Post image 3"
					onClick={(e) => openModal(e, 2)}
				/>
				{count > 3 && (
					<div
						className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center cursor-pointer"
						onClick={(e) => openModal(e, 2)}
					>
						<span className="text-white text-xl font-bold">+{count - 3}</span>
					</div>
				)}
			</div>
		</div>
	);

	const renderImageGallery = () => {
		if (count === 1) return renderSingleImage();
		if (count === 2) return renderTwoImages();
		if (count === 3) return renderThreeImages();
		if (count === 4) return renderFourImages();
		if (count >= 5) return renderFiveOrMoreImages();
		return null;
	};

	return (
		<div className="flex flex-col gap-3 overflow-hidden mb-3">
			<p className="whitespace-pre-wrap open-sans-medium">{content}</p>
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