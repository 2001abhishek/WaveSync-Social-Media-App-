import React, { useState, useEffect } from "react";
import { XMarkIcon, ChevronDoubleRightIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { useUser } from "../context/UserContext";
import { gql, useMutation } from "@apollo/client";

// GraphQL mutation to create a comment (both master and nested)
const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($user_post_id: ID!, $content: String!, $master_comment_id: ID) {
    createComment(user_post_id: $user_post_id, content: $content, master_comment_id: $master_comment_id) {
      status
      message
      comment {
        id
        content
        created_at
        user {
          id
          name
          userProfile {
            avatar_path
          }
        }
        nestedComments {
          id
          content
          created_at
          user {
            id
            name
          }
        }
      }
    }
  }
`;

const CommentPopup = ({ post, onClose }: { post: any; onClose: () => void }) => {
  const { theme, user } = useUser();
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState(post.comments || []); // Local state for comments

  // Use the mutation
  const [createComment] = useMutation(CREATE_COMMENT_MUTATION);

  const handleCommentSubmit = async (masterCommentId: string | null = null) => {
    const newComment = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic rendering
      content: commentText,
      created_at: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        userProfile: { avatar_path: user?.userProfile?.avatar_path },
      },
      nestedComments: [],
    };

    try {
      // Optimistically update the UI by adding the new comment to the local state
      if (masterCommentId) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === masterCommentId
              ? {
                  ...comment,
                  nestedComments: [...comment.nestedComments, newComment],
                }
              : comment
          )
        );
      } else {
        setComments((prevComments) => [newComment, ...prevComments]);
      }

      // Clear input and reset reply state
      setCommentText("");
      if (masterCommentId) setReplyingTo(null);

      // Send the mutation to the server
      await createComment({
        variables: {
          user_post_id: post.id,
          content: newComment.content,
          master_comment_id: masterCommentId,
        },
        update: (cache, { data: { createComment } }) => {
          const addedComment = createComment.comment;
          // Replace the temporary comment ID with the actual one from the server
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === newComment.id
                ? { ...newComment, id: addedComment.id }
                : comment
            )
          );
        },
      });
    } catch (error) {
      console.error("Failed to submit comment", error);
      // Optionally: Remove the comment from the UI if the mutation fails
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== newComment.id)
      );
    }
  };

  const toggleNestedComments = (commentId: string) => {
    setExpandedComments(expandedComments === commentId ? null : commentId);
  };

  const userAvatar = user?.userProfile?.avatar_path
    ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${user.userProfile.avatar_path}`
    : "/default-avatar.png"; // Default avatar if none is available
    const renderImageGrid = (images: string[]) => {
      return (
        <div className="grid grid-cols-2 gap-1 relative">
          {images.slice(0, 4).map((image: string, index: number) => (
            <div key={index} className="relative">
              <img
                src={`https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${image}`}
                alt="Post image"
                className="w-full h-32 object-cover rounded-lg"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <span className="text-white text-lg font-bold">
                    +{images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden overflow-y-auto custom-scrollbar pop-up ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-neutral-100 text-black"
        }`}
      >
{/* Header */}
<div className="relative flex justify-center items-center p-4 border-b border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold">{post.user?.name ? `${post.user.name}'s Post` : "User's Post"}</h2>
  <div onClick={onClose} className="absolute right-4 top-4 cursor-pointer">
    <XMarkIcon
      className={`w-6 h-6 ${
        theme === "dark"
          ? "text-gray-400 hover:text-gray-200"
          : "text-gray-500 hover:text-gray-700"
      }`}
    />
  </div>
</div>


        {/* Post Description */}
        <div className="p-4">
          <p className="mb-2">{post.description}</p>
          {post.image_paths.length === 1 ? (
        <img src={`https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${post.image_paths[0]}`} alt="Post" className="w-full h-64 object-cover rounded-lg mb-2" />
      ) : (
        renderImageGrid(post.image_paths)
      )}
        </div>

        {/* Comments Section */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="mb-4">
              <div className="flex items-start space-x-2">
                <img
                  src={
                    comment.user.userProfile?.avatar_path
                      ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${comment.user.userProfile.avatar_path}`
                      : "/default-avatar.png"
                  }
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-grow">
                  <div
                    className={`rounded-lg p-2 ${
                      theme === "dark" ? "bg-gray-700" : "bg-neutral-200"
                    }`}
                  >
                    <p className="font-semibold">{comment.user.name}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Like</span> ·{" "}
                    <span 
                      onClick={() =>
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      }
                      className="cursor-pointer"
                    >
                      Reply
                    </span>{" "}
                    · <span>{timeSince(new Date(comment.created_at))}</span>
                    {comment.nestedComments && comment.nestedComments.length > 0 && (
                      <span>
                        {" "}
                        ·{" "}
                        <span
                          onClick={() => toggleNestedComments(comment.id)}
                          className="cursor-pointer"
                        >
                          {expandedComments === comment.id ? `Hide` : `See`}{" "}
                          {comment.nestedComments.length}{" "}
                          {comment.nestedComments.length > 1 ? "replies" : "reply"}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Nested comments */}
                  {expandedComments === comment.id &&
                    comment.nestedComments &&
                    comment.nestedComments.length > 0 && (
                      <div className="ml-10 mt-2">
                        {comment.nestedComments.map((nestedComment: any) => (
                          <div key={nestedComment.id} className="mb-2">
                            <div className="flex items-start space-x-2">
                              <img
                                src={
                                  nestedComment.user.userProfile?.avatar_path
                                    ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${nestedComment.user.userProfile.avatar_path}`
                                    : "/default-avatar.png"
                                }
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-grow">
                                <div
                                  className={`rounded-lg p-2 ${
                                    theme === "dark" ? "bg-gray-700" : "bg-neutral-200"
                                  }`}
                                >
                                  <p className="font-semibold">
                                    {nestedComment.user.name}
                                  </p>
                                  <p className="text-sm">{nestedComment.content}</p>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Like</span> ·{" "}
                                  <span>{timeSince(new Date(nestedComment.created_at))}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Reply box */}
                  {replyingTo === comment.id && (
  <div className="ml-10 mt-2 flex items-center">
    <input
      type="text"
      placeholder="Write a reply..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      className={`w-full rounded-full p-2 ${
        theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
      }`}
    />
    <div
      onClick={() => handleCommentSubmit(comment.id)}
      className="ml-2 cursor-pointer flex items-center text-sm text-blue-500 mb-4"
    >
      <ArrowRightCircleIcon className="w-8 h-8" /> {/* ArrowRightCircle Icon */}
      
    </div>
  </div>
)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-2">
          <img
            src={userAvatar}
            alt=""
            className="w-9 h-8 rounded-full object-cover mb-3"
          />
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className={`flex-grow rounded-full p-2 ${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-neutral-200 text-black"
            }`}
          />
          <div onClick={() => handleCommentSubmit()} className="text-blue-500 mb-4">
            <ChevronDoubleRightIcon className="w-6 h-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to calculate time since a date
function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const time = Math.floor(seconds / interval.seconds);
    if (time >= 1) {
      return `${time} ${interval.label}${time > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export default CommentPopup;
