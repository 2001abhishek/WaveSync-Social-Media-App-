"use client";

import { useState } from "react";
import { useUser } from "../context/UserContext";
import { gql, useMutation } from "@apollo/client";
import { PlusCircleIcon } from "@heroicons/react/24/outline"; // Importing the PlusCircle icon from Heroicons v2
import { toast } from "sonner"; // Import Sonner for toast notifications
import { useDispatch } from "react-redux";
import { addPost } from "../features/postSlice";

const CREATE_POST_MUTATION = gql`
  mutation CreateUserPost($description: String!, $images: [Upload!]!) {
    createUserPost(description: $description, images: $images) {
      status
      message
      userPost {
        id
        description
        image_path
        image_path2
        image_path3
        image_path4
      }
    }
  }
`;

const CreatePost = () => {
  const { user, theme } = useUser(); // Access the theme state here
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<File[]>([]); // Changed to an array for multiple images
  const dispatch = useDispatch();
  
  const [fileNames, setFileNames] = useState<string[]>(["No file chosen", "No file chosen", "No file chosen", "No file chosen"]);

  const [createPost, { loading, error }] = useMutation(CREATE_POST_MUTATION);

  const handleImageChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newImages = [...images];
      if (newImages.length < 4) {
        newImages[index] = event.target.files[0];
        const newFileNames = [...fileNames];
        newFileNames[index] = event.target.files[0].name;
        setImages(newImages);
        setFileNames(newFileNames);
      } else {
        alert("Maximum images is 4.");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caption || images.length === 0) {
      alert("Please provide both a caption and at least one image.");
      return;
    }

    try {
      const { data } = await createPost({
        variables: {
          description: caption,
          images: images,
        },
      });

      if (data.createUserPost.status) {
        dispatch(addPost(data.createUserPost.userPost)); // Add post to Redux store
        toast.success("Post published successfully!");
        setCaption("");
        setImages([]);
        setFileNames(["No file chosen", "No file chosen", "No file chosen", "No file chosen"]);
      } else {
        console.error("Failed to create post:", data.createUserPost.message);
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      } p-4 rounded-md shadow-md mb-4`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-xl font-bold mb-2">Create Post</h2>
        <textarea
          placeholder="Write your caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={`border rounded p-2 mb-2 h-14 ${
            theme === "dark" ? "bg-gray-600 text-white" : "bg-white"
          }`}
          rows={4}
        />
        {images.map((_, index) => (
          <div className="flex items-center mb-2" key={index}>
            <label className="cursor-pointer flex items-center">
              <PlusCircleIcon className="h-8 w-8 text-blue-500" /> {/* Larger Plus Icon */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange(index)}
                className="hidden"
              />
            </label>
            <span className="ml-2">{fileNames[index]}</span>
          </div>
        ))}
        {images.length < 4 && (
          <div className="flex items-center mb-2">
            <label className="cursor-pointer flex items-center">
              <PlusCircleIcon className="h-8 w-8 text-blue-500" /> {/* Plus Icon for adding another image */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange(images.length)}
                className="hidden"
              />
            </label>
            <span className="ml-2">Add another image</span>
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish"}
        </button>
        {error && <p className="text-red-500">Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
