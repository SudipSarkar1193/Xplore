import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../../BackendServer";
import { useAuthContext } from "../../context/AuthContext"; // Import context
import { Link } from "react-router-dom";
import useComment from "../../custom_hooks/useComment";

const CreatePost = ({ type = "post" }) => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const imgRef = useRef(null);

	const { authUser, authToken } = useAuthContext(); // Get user and token
	console.log("authToken ->>>>", authToken);
	const queryClient = useQueryClient();

	const { commentPost, isCommenting } = useComment;

	const {
		mutate: createPost,
		isError,
		isPending,
	} = useMutation({
		mutationFn: async ({ content, imageUrls }) => {
			try {
				console.log("BAL", `Bearer ${authToken}`);
				const res = await fetch(`${backendServer}/api/posts`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify({ content, imageUrls }),
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
			setImg(null);
			setText("");
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error(error);
		},
	});

	const handlePostComment = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevent navigation

		if (isCommenting || !content.trim()) return;

		commentPost({ parentPostUuid: post.postUuid, content });
		setComment("");
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isPending) return;
		if (!text.trim() && !img) {
			toast.error("Please enter some text or select an image");
			return;
		}
		if (text.length > 320) {
			toast.error("Post content exceeds 320 characters");
			return;
		}

		const imageUrls = img ? [img] : [];
		createPost({ content: text, imageUrls });
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="flex p-4 items-start gap-4 border-b border-gray-700">
			<div className="avatar">
				<div className="w-8 rounded-full">
					<Link to={`/profile/${authUser?.username}`}>
						{/* Use the user's profile picture or a placeholder */}
						<img
							src={authUser?.profilePictureUrl || "/avatar-placeholder.png"}
						/>
					</Link>
				</div>
			</div>
			<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
				<textarea
					className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
					placeholder="What is happening?!"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{img && (
					<div className="relative w-72 mx-auto">
						<IoCloseSharp
							className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer hover:scale-50"
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img
							src={img}
							className="w-full mx-auto h-72 object-contain rounded"
						/>
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
					<input type="file" hidden ref={imgRef} onChange={handleImgChange} />
					<button className="btn btn-primary rounded-full btn-sm text-white px-4">
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className="text-red-500">Something went wrong</div>}
			</form>
		</div>
	);
};
export default CreatePost;
