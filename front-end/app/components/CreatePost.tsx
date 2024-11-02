"use client";

import { useState } from "react";
import { useUser } from "../context/UserContext";
import { gql, useMutation } from "@apollo/client";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addPost } from "../features/postSlice";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import the X icon


const CREATE_POST_MUTATION = gql`
  mutation CreateUserPost($description: String!, $images: [Upload!]!) {
    createUserPost(description: $description, images: $images) {
      status
      message
      userPost {
        id
        description
        image_paths
      }
    }
  }
`;

const CreatePost = () => {
  const { user, theme } = useUser();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<File[]>([]); // Handle multiple images dynamically
  const [fileNames, setFileNames] = useState<string[]>([]);
  const dispatch = useDispatch();
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress


  const [createPost, { loading, error }] = useMutation(CREATE_POST_MUTATION);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newImage = event.target.files[0];
      setImages((prevImages) => [...prevImages, newImage]);
      setFileNames((prevNames) => [...prevNames, newImage.name]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setFileNames((prevNames) => prevNames.filter((_, i) => i !== index));
  };
  const simulateUploadProgress = () => {
    // Clear previous progress
    setUploadProgress(0);

    // Set an interval to simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 10) + 5; // Increment progress by a random amount
        } else {
          clearInterval(progressInterval); // Stop incrementing at around 90%
          return prev;
        }
      });
    }, 300); // Adjust the interval time as needed

    return progressInterval;
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caption || images.length === 0) {
      alert("Please provide both a caption and at least one image.");
      return;
    }
    const progressInterval = simulateUploadProgress(); // Start progress simulation

    try {
      const { data } = await createPost({
        variables: {
          description: caption,
          images: images,
        },
      });
      clearInterval(progressInterval); // Stop the simulated progress interval
      setUploadProgress(100); // Set progress to 100 on completion

      if (data.createUserPost.status) {
        dispatch(addPost(data.createUserPost.userPost));
        toast.success("Post published successfully!");
        setCaption("");
        setImages([]);
        setFileNames([]);
      } else {
        console.error("Failed to create post:", data.createUserPost.message);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      clearInterval(progressInterval);
      setUploadProgress(0); // Reset progress if an error occurs

    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto ${theme === "dark" ? "bg-gray-900" : "bg-gray-200"
        } p-4 rounded-md shadow-md mb-4`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-xl font-bold mb-2">Create Post</h2>
        <textarea
          placeholder="Write your caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={`border rounded p-2 mb-2 h-14 ${theme === "dark" ? "bg-gray-600 text-white" : "bg-white"
            }`}
          rows={4}
        />

<div className="flex flex-wrap gap-4 items-center mb-2">
  {images.map((image, index) => (
    <div
      key={index}
      className="relative w-16 h-16 border border-gray-900 rounded overflow-hidden"
    >
      {/* X icon positioned outside the top-right corner */}
      <div
        onClick={() => handleRemoveImage(index)}
        className="absolute -top-1 -right-1 text-red-500 cursor-pointer transform transition-transform duration-200 hover:scale-125"
      >
        <XMarkIcon className="h-5 w-5" />
      </div>

      {/* Display image preview */}
      <img
        src={URL.createObjectURL(image)}
        alt={`Preview ${index}`}
        className="w-full h-full object-cover rounded"
      />

      {/* Image name below the preview with padding */}
      <span className="block text-center text-xs mt-2 px-1">
        {fileNames[index].length > 10
          ? `${fileNames[index].slice(0, 10)}...`
          : fileNames[index]}
      </span>
    </div>
  ))}
</div>



        <div className="flex items-center mb-2">
          <label className="cursor-pointer flex items-center">
            <PlusCircleIcon className="h-8 w-8 text-blue-500" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <span className="ml-2">Add image</span>
        </div>
        {/* Upload Progress Bar */}
        {loading && (
          <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

        {error && <p className="text-red-500">Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
