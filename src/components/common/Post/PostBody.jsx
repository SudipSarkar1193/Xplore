import React, { useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { useVideoObserver } from "../../../context/VideoObserverContext";

const PostBody = ({ content, imageUrls, videoUrl, postType }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [touchStart, setTouchStart] = useState(0);

	const videoRef = useRef(null);
	useVideoObserver(videoRef);

	if (postType === "VIDEO_SHORT") {
		return (
			<div className="flex flex-col gap-3 overflow-hidden mb-3">
				<p className="whitespace-pre-wrap open-sans-medium">{content}</p>
				{videoUrl && (
					<div
						className="w-full rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center bg-black cursor-pointer"
						onClick={(e) => e.stopPropagation()}
						style={{ minHeight: "76vh" }}
					>
						<video
							ref={videoRef}
							src={videoUrl}
							controls
							loop
							// muted
							playsInline
							preload="metadata" // Helps with loading
							className="w-full h-full md:max-h-[600px] object-contain"
							onLoadedData={() => console.log("Video loaded:", videoUrl)}
							onError={(e) => console.error("Video error:", e)}
						/>
					</div>
				)}
			</div>
		);
	}

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

	const closeModal = (e) => {
		e.stopPropagation();
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

	const handleTouchStart = (e) => {
		setTouchStart(e.touches[0].clientX);
	};

	const handleTouchEnd = (e) => {
		const touchEnd = e.changedTouches[0].clientX;
		if (touchStart - touchEnd > 75) {
			// Swiped left
			showNextImage(e);
		} else if (touchEnd - touchStart > 75) {
			// Swiped right
			showPrevImage(e);
		}
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
			<div onClick={(e) => e.stopPropagation()}>{renderImageGallery()}</div>

			{isModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85"
					onClick={closeModal}
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
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
