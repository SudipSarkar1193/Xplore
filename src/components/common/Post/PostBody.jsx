const PostBody = ({ content, imageUrls }) => {
	
    //Render function for images
    const renderImageGallery = () => {
		if (!imageUrls || imageUrls.length === 0) return null;
		const count = imageUrls.length;

		if (count === 1) {
			return (
				<img
					src={imageUrls[0]}
					className="w-full h-80 object-cover rounded-lg border border-gray-700"
					alt="Post image"
				/>
			);
		}
		if (count === 2) {
			return (
				<div className="grid grid-cols-2 gap-2">
					{imageUrls.map((url, index) => (
						<img
							key={index}
							src={url}
							className="w-full h-60 object-cover rounded-lg border border-gray-700"
							alt={`Post image ${index + 1}`}
						/>
					))}
				</div>
			);
		}
		if (count === 3) {
			return (
				<div className="grid grid-cols-2 gap-2 h-64">
					<img
						src={imageUrls[0]}
						className="row-span-2 h-full w-full object-cover rounded-lg border border-gray-700"
						alt="Post image 1"
					/>
					<img
						src={imageUrls[1]}
						className="h-full w-full object-cover rounded-lg border border-gray-700"
						alt="Post image 2"
					/>
					<img
						src={imageUrls[2]}
						className="h-full w-full object-cover rounded-lg border border-gray-700"
						alt="Post image 3"
					/>
				</div>
			);
		}
		// Layout for 4 or more images
		return (
			<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
				{imageUrls.slice(0, 3).map((url, index) => (
					<img
						key={index}
						src={url}
						className={`${
							index === 0 ? "row-span-2" : ""
						} h-full w-full object-cover rounded-lg border border-gray-700`}
						alt={`Post image ${index + 1}`}
					/>
				))}
				<div className="relative h-full w-full">
					<img
						src={imageUrls[3]}
						className="h-full w-full object-cover rounded-lg border border-gray-700"
						alt="Post image 4"
					/>
					{count > 4 && (
						<div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
							<span className="text-white text-xl font-bold">+{count - 4}</span>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-3 overflow-hidden mb-3">
			<p className="whitespace-pre-wrap open-sans-medium">{content}</p>
			{renderImageGallery()}
		</div>
	);
};

export default PostBody;
