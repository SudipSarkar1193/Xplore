import { CiImageOn } from "react-icons/ci";
import { FiVideo } from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useModal } from "../../context/ModalContext";

const CreatePostPage = ({ mode, parentPostUuid }) => {
	const [text, setText] = useState("");
	const [imgs, setImgs] = useState([]);
	const [imageFiles, setImageFiles] = useState([]);
	const [videoFile, setVideoFile] = useState(null);
	const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

	const fileInputRef = useRef(null);
	const textRef = useRef(null);

	const { authUser, authToken } = useAuthContext();
	const queryClient = useQueryClient();
	const { closeModal } = useModal();

	const maxImages = 10;
	const maxVideoSizeMB = 200; 

	useEffect(() => {
		// Auto-resize textarea
		if (textRef.current) {
			textRef.current.style.height = "auto";
			textRef.current.style.height = `${textRef.current.scrollHeight}px`;
		}
	}, [text]);

	const { mutate: createPost, isPending: isPosting } = useMutation({
		mutationFn: async (formData) => {
			const res = await fetch(`${backendServer}/api/posts`, {
				method: "POST",
				headers: { Authorization: `Bearer ${authToken}` },
				body: formData,
			});
			const jsonRes = await res.json();
			if (!res.ok) throw new Error(jsonRes.message || "Failed to create post");
			return jsonRes;
		},
		onSuccess: () => {
			toast.success("Post created successfully!");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			closeModal();
		},
		onError: (error) => toast.error(error.message),
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isPosting) return;

		const isContentEmpty = !text.trim();
		const isMediaEmpty = mode === "post" ? imageFiles.length === 0 : !videoFile;

		if (isContentEmpty && isMediaEmpty) {
			toast.error("Please add content, an image, or a video.");
			return;
		}

		const formData = new FormData();
		formData.append("content", text);

		if (mode === "short" && videoFile) {
			formData.append("video", videoFile);
		} else if (mode === "post" && imageFiles.length > 0) {
			imageFiles.forEach((file) => formData.append("images", file));
		}

		createPost(formData);
	};

	const handleFileChange = (e) => {
		if (mode === "post") {
			handleImageFiles(e.target.files);
		} else if (mode === "short") {
			handleVideoFile(e.target.files[0]);
		}
	};

	const handleImageFiles = (files) => {
		const fileList = Array.from(files);
		const remainingSlots = maxImages - imageFiles.length;
		if (remainingSlots <= 0) {
			toast.error(`You can only upload up to ${maxImages} images.`);
			return;
		}
		const filesToAdd = fileList.slice(0, remainingSlots);
		setImageFiles((prev) => [...prev, ...filesToAdd]);
		filesToAdd.forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => setImgs((prev) => [...prev, reader.result]);
			reader.readAsDataURL(file);
		});
	};

	const handleVideoFile = (file) => {
		if (!file) return;
		if (file.size > maxVideoSizeMB * 1024 * 1024) {
			toast.error(`Video file cannot exceed ${maxVideoSizeMB}MB.`);
			return;
		}
		setVideoFile(file);
		setVideoPreviewUrl(URL.createObjectURL(file));
	};

	const removeImage = (indexToRemove) => {
		setImgs((prev) => prev.filter((_, i) => i !== indexToRemove));
		setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
	};

	const removeVideo = () => {
		setVideoFile(null);
		if (videoPreviewUrl) {
			URL.revokeObjectURL(videoPreviewUrl);
			setVideoPreviewUrl(null);
		}
	};

	return (
		<div className="flex p-4 items-start gap-4">
			<div className="avatar">
				<div className="w-8 rounded-full">
					<Link to={`/profile/${authUser?.username}`}>
						<img
							src={authUser?.profilePictureUrl || "/avatar-placeholder.png"}
							alt="User avatar"
						/>
					</Link>
				</div>
			</div>
			<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
				<textarea
					ref={textRef}
					className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none bg-transparent"
					placeholder={mode === "short" ? "Add a caption..." : "What is happening?!"}
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>

				{/* Media Preview Section */}
				{mode === 'post' && imgs.length > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{imgs.map((imgSrc, index) => (
							<div key={index} className="relative">
								<IoCloseSharp
									className="absolute top-1 right-1 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer hover:bg-red-600"
									onClick={() => removeImage(index)}
								/>
								<img src={imgSrc} className="w-full h-32 object-cover rounded" alt={`Preview ${index}`} />
							</div>
						))}
					</div>
				)}

				{mode === 'short' && videoPreviewUrl && (
					<div className="relative">
						<IoCloseSharp
							className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-6 h-6 z-10 cursor-pointer hover:bg-red-600"
							onClick={removeVideo}
						/>
						<video src={videoPreviewUrl} controls className="w-full max-h-60 rounded" />
					</div>
				)}

				{/* Action Bar */}
				<div className="flex justify-between border-t py-2 border-t-gray-700">
					<div className="flex gap-2 items-center">
						{mode === 'post' ? (
							<CiImageOn
								className="fill-primary w-6 h-6 cursor-pointer"
								onClick={() => fileInputRef.current.click()}
							/>
						) : (
							<FiVideo
								className="text-primary w-6 h-6 cursor-pointer"
								onClick={() => fileInputRef.current.click()}
							/>
						)}
					</div>
					<input
						type="file"
						hidden
						ref={fileInputRef}
						onChange={handleFileChange}
						accept={mode === "post" ? "image/*" : "video/*"}
						multiple={mode === "post"}
					/>
					<button
						className="btn btn-primary rounded-full btn-sm text-white px-4"
						disabled={isPosting}
					>
						{isPosting ? "Posting..." : "Post"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreatePostPage;