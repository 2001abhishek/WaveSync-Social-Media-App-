import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updatePost } from "../features/postSlice";

// Mutation only for updating the description
const UPDATE_POST_MUTATION = gql`
  mutation UpdateUserPost($id: ID!, $description: String!) {
    updateUserPost(id: $id, description: $description) {
      status
      message
      userPost {
        id
        description
        updated_at
      }
    }
  }
`;

const EditPostModal = ({ post, onClose }: { post: any, onClose: () => void }) => {
  const [description, setDescription] = useState(post.description);
  const [updateUserPost] = useMutation(UPDATE_POST_MUTATION);
  const dispatch = useDispatch();

  const handleUpdate = () => {
    updateUserPost({
      variables: {
        id: post.id,
        description,
      },
      onCompleted: (data) => {
        const updatedPost = data.updateUserPost.userPost;
        dispatch(updatePost({
          id: updatedPost.id,
          description: updatedPost.description,
          image_path: post.image_path,  // Keep the existing image path
        }));
        onClose(); // Close modal after successful update
      },
      onError: (error) => {
        console.error("Error updating post:", error);
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 fade-in-top">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          rows={4}
        />

        <div className="flex justify-end">
          <button onClick={onClose} className="mr-4 bg-gray-300 p-2 rounded">
            Cancel
          </button>
          <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
