"use client";

import { useState } from "react";
import { useUser } from "../context/UserContext";
import { gql, useMutation } from "@apollo/client";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
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
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
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

        <div className="flex flex-wrap items-center mb-2 space-x-2">
          {images.map((image, index) => (
            <div key={index} className="flex items-center">
              <span className="ml-2">
                {fileNames[index].length > 10
                  ? `${fileNames[index].slice(0, 10)}...`
                  : fileNames[index]}
              </span>
              <div
                onClick={() => handleRemoveImage(index)}
                className="ml-1 text-red-500 cursor-pointer transform transition-transform duration-200 hover:scale-125"
              >
                <TrashIcon className="h-5 w-5" />
              </div>
              {index < images.length - 1 && <span>,</span>}
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
