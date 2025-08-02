// src/components/common/Post/Comment.jsx

import React from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../../utils/timeAgo";
import { FaRegComment } from "react-icons/fa";
import useComment from "../../../custom_hooks/useComment";
import { useState } from "react";

const Comment = ({ comment }) => {

    console.log("comment",comment);

	const formattedDate = timeAgo(comment.createdAt);

	// to handle nested comments, we can check if the comment has a 'comments' field
	const hasNestedComments = comment.comments && comment.comments.length > 0;

    const { commentPost, isCommenting } = useComment();
    const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState("");

    const handlePostReply = (e) => {
		e.preventDefault();
		if (isCommenting || !replyContent.trim()) return;
		commentPost({ parentPostUuid: comment.parentPostUuid, content: replyContent });
		setReplyContent("");
		setShowReplyForm(false);
	};
	

	return (
		<div className="flex gap-2 items-start">
			<div className="avatar">
				<div className="w-8 rounded-full">
					<Link to={`/profile/${comment.authorUsername}`}>
						<img
							src={
								comment.authorProfilePictureUrl || "/avatar-placeholder.png"
							}
						/>
					</Link>
				</div>
			</div>
			<div className="flex flex-col w-full">
				<div className="bg-gray-800 rounded-lg p-2">
					<div className="flex items-center gap-1">
						<Link
							to={`/profile/${comment.authorUsername}`}
							className="font-bold text-sm"
						>
							{comment.authorUsername}
						</Link>
						<span className="text-gray-500 text-xs">· {formattedDate}</span>
					</div>
					<div className="text-sm mt-1">
						<p className="whitespace-pre-wrap">{comment.content}</p>
					</div>
				</div>

				{/* Reply button toggles the form */}
				<div className="flex items-center gap-2 mt-1 pl-2">
					<button
						className="text-xs text-gray-500 hover:underline"
						onClick={() => setShowReplyForm(!showReplyForm)}
					>
						Reply
					</button>
				</div>

				{/* Reply Form */}
				{showReplyForm && (
					<form
						className="flex gap-2 items-center mt-2"
						onSubmit={handlePostReply}
					>
						<textarea
							className="textarea w-full p-1 rounded text-sm resize-none border focus:outline-none border-gray-700 bg-gray-900"
							placeholder={`Replying to @${comment.authorUsername}`}
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
						/>
						<button
							className="btn btn-primary rounded-full btn-xs text-white px-3"
							disabled={isCommenting}
						>
							{isCommenting ? <LoadingSpinner size="xs" /> : "Post"}
						</button>
					</form>
				)}

				{/* Render nested comments */}
				{hasNestedComments && (
					<div className="pl-6 border-l-2 border-gray-700 mt-2 flex flex-col gap-2">
						{comment.comments.map((nestedComment) => (
							<Comment key={nestedComment.postUuid} comment={nestedComment} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Comment;