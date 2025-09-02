import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import useComment from "../../custom_hooks/useComment";

const CreatePost = ({ parentPostUuid, maxImages = 10 }) => {
	const [text, setText] = useState("");
	const [imgs, setImgs] = useState([]); // State for image previews
	const [imageFiles, setImageFiles] = useState([]); // State for actual File objects
	const imgRef = useRef(null);
	const textRef = useRef(null);

	const { authUser, authToken } = useAuthContext();
	const queryClient = useQueryClient();

	const { commentPost, isCommenting } = useComment();

	useEffect(() => {
		if (textRef.current) {
			textRef.current.style.height = "auto";
			textRef.current.style.height = `${textRef.current.scrollHeight}px`;
		}
	}, [text]);

	const {
		mutate: createPost,
		isPending: isCreatingPost,
		isError,
	} = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`${backendServer}/api/posts`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
					body: formData,
				});

				const jsonRes = await res.json();
				if (!res.ok) {
					throw new Error(jsonRes.message || "Error creating the post");
				}
				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			setText("");
			setImgs([]);
			setImageFiles([]);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error(error);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isCreatingPost || isCommenting) return;
		if (!text.trim() && imageFiles.length === 0) {
			toast.error("Please enter some text or select an image");
			return;
		}
		if (text.length > 320) {
			toast.error("Post content exceeds 320 characters");
			return;
		}

		// This is the main logic change
		if (parentPostUuid) {
			const formData = new FormData();
			const commentRequest = { content: text };
			formData.append(
				"commentRequest",
				new Blob([JSON.stringify(commentRequest)], { type: "application/json" })
			);
			imageFiles.forEach((file) => {
				formData.append("images", file);
			});
			commentPost({ parentPostUuid, formData });
			setText("");
			setImgs([]);
			setImageFiles([]);
		} else {
			const formData = new FormData();
			formData.append("content", text);
			imageFiles.forEach((file) => {
				formData.append("images", file);
			});
			createPost(formData);
		}
	};

	const handleImgChange = (e) => {
		const files = Array.from(e.target.files);
		const remainingSlots = maxImages - imgs.length;

		if (remainingSlots <= 0) {
			toast.error(`You can only upload a maximum of ${maxImages} images.`);
			return;
		}

		const filesToAdd = files.slice(0, remainingSlots);

		setImageFiles((prevFiles) => [...prevFiles, ...filesToAdd]);

		filesToAdd.forEach((file) => {
			if (file) {
				const reader = new FileReader();
				reader.onload = () => {
					setImgs((prevImgs) => [...prevImgs, reader.result]);
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const removeImage = (indexToRemove) => {
		setImgs((prev) => prev.filter((_, index) => index !== indexToRemove));
		setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
		if (imgRef.current) {
			imgRef.current.value = null;
		}
	};

	const isPending = isCreatingPost || isCommenting;

	return (
		<div className="flex p-4 items-start gap-4 border-b border-gray-700">
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
					className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
					placeholder={
						parentPostUuid ? "Post your reply" : "What is happening?!"
					}
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{imgs.length > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{imgs.map((imgSrc, index) => (
							<div key={index} className="relative">
								<IoCloseSharp
									className="absolute top-1 right-1 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer hover:bg-red-600 transition-colors"
									onClick={() => removeImage(index)}
								/>
								<img
									src={imgSrc}
									className="w-full h-32 object-cover rounded"
									alt={`Selected image ${index + 1}`}
								/>
							</div>
						))}
					</div>
				)}
				<div className="flex justify-between border-t py-2 border-t-gray-700">
					<div className="flex gap-1 items-center">
						<CiImageOn
							className="fill-primary w-6 h-6 cursor-pointer"
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
					</div>
					<input
						type="file"
						multiple
						hidden
						ref={imgRef}
						onChange={handleImgChange}
						accept="image/*"
					/>
					<button
						className="btn btn-primary rounded-full btn-sm text-white px-4"
						disabled={isPending}
					>
						{isPending ? "Posting..." : parentPostUuid ? "Reply" : "Post"}
					</button>
				</div>
				{isError && <div className="text-red-500">Something went wrong</div>}
			</form>
		</div>
	);
};
export default CreatePost;