import { gql, useQuery, useMutation } from "@apollo/client";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import {HeartIcon as HeartIconSolid,} from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon, ShareIcon, HeartIcon as HeartIconOutline, } from "@heroicons/react/24/outline";
import CommentPopup from "./CommentPopup";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, updateLike } from "../features/postSlice";
import { RootState } from "../store";
import EditPostModal from "./EditPostModal";
import ImageSlide from "./ImageSlide";



// GraphQL mutations and queries
const TOGGLE_LIKE_MUTATION = gql`
      mutation ToggleLike($user_post_id: ID!) {
        toggleLike(user_post_id: $user_post_id) {
          status
          message
          liked
          likedItem {
            ... on UserPost {
              id
              likesCount
            }
          }
        }
      }
    `;

const FETCH_ALL_POSTS = gql`
      query AllPosts {
        allPosts {
          id
          description
          image_paths
          liked
          likesCount
          created_at
          user {
            id
            name
            userProfile {
              avatar_path
            }
          }
          comments {
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
                  userProfile {
                    avatar_path
                }
              }
            }
          }
        }
      }
    `;

const PostCard = () => {
  const { theme, user: currentUser } = useUser(); // Access the current user context
  const posts = useSelector((state: RootState) => state.posts.posts);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false); // Modal state
  const [selectedPost, setSelectedPost] = useState<any>(null); // Selected post for editing
  const handleEditClick = (post: any) => {
    setSelectedPost(post); // Set the post to be edited
    setIsEditing(true); // Open the modal
  };

  const closeModal = () => {
    setIsEditing(false);
    setSelectedPost(null);
  };


  const { data, loading, error, fetchMore } = useQuery(FETCH_ALL_POSTS, {
    variables: { limit: 10, offset: 0 },
    onCompleted: (data) => {
      dispatch(setPosts(data.allPosts)); // Set posts in Redux store
    },
  });

  // Manage like states and comment toggles
  const [toggleLike] = useMutation(TOGGLE_LIKE_MUTATION);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const storedLikes = JSON.parse(localStorage.getItem(`likedPosts_${currentUser.id}`) || "{}");
      setLikedPosts(storedLikes);
    }
  }, [currentUser]);


  const handleLike = (postId: string, isLiked: boolean) => {
    toggleLike({
      variables: { user_post_id: postId },
      onCompleted: (data) => {
        // Update the like count and liked status in Redux store
        const updatedPost = data.toggleLike.likedItem;
        dispatch(updateLike({ postId, likesCount: updatedPost.likesCount, liked: !isLiked }));
      },
      onError: (error) => {
        console.error("Error toggling like:", error);
      },
    });
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollY + clientHeight >= scrollHeight - 200 && !loading) {
      // Fetch more posts when scrolled to the bottom
      fetchMore({
        variables: {
          offset: posts.length,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          // Add artificial delay to show the loading icon for longer
          setTimeout(() => {
            dispatch(setPosts([...posts, ...fetchMoreResult.allPosts])); // Append new posts
          }, 1500); // 1.5 seconds delay
        },
      });
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [posts, loading]);


  const handleCommentToggle = (postId: string) => {
    setActiveCommentPost(activeCommentPost === postId ? null : postId);
  };

  const PostCardSkeleton = () => {
    return (
      <div className="max-w-2xl mx-auto p-4 rounded-lg shadow-lg mb-4 bg-gray-200 animate-pulse">
        {/* User Avatar and Name */}
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="ml-2">
            <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
  
        {/* Post Description */}
        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
  
        {/* Post Image */}
        <div className="w-full h-64 bg-gray-300 rounded mb-2"></div>
  
        {/* Like and Comment Count */}
        <div className="flex justify-between text-sm mb-2">
          <div className="h-4 bg-gray-300 rounded w-12"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
  
        <hr className="my-2 border-gray-400" />
  
        {/* Post Actions (Like, Comment, Share) */}
        <div className="flex justify-between items-center ml-12">
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    );
  };
  const renderImageGrid = (images: string[]) => {
    return (
      <div className="grid grid-cols-2 gap-1 relative cursor-pointer">
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
  const [isImageSlideOpen, setIsImageSlideOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const handleImageClick = (imagePaths: string[]) => {
    const fullUrls = imagePaths.map(
      (path) => `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${path}`
    );
    setSelectedImages(fullUrls);
    setIsImageSlideOpen(true);
  };
    

  
  if (error) return <p>Error fetching posts!</p>;

  return (
    <div className="space-y-6">
      {loading && posts.length === 0 ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : (
        posts.map((post: any) => {
          const isLiked = post.liked;
          const isCurrentUserPost =
            post.user?.id && currentUser?.id && post.user.id === currentUser.id;

          return (
            <div
              key={post.id}
              className={`max-w-2xl mx-auto p-4 rounded-lg shadow-lg mb-4 z-50 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-neutral-200 text-black"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img
                    src={
                      post.user?.userProfile?.avatar_path
                        ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${post.user.userProfile.avatar_path}`
                        : "https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    }
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="ml-2">
                    <p className="font-semibold">
                      {post.user?.name || currentUser?.name || "Unknown user"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>

                {isCurrentUserPost && (
                  <div
                    className="group flex items-center cursor-pointer hover:gap-2 transition-all duration-200"
                    onClick={() => handleEditClick(post)}
                  >
                    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[4rem] transition-all duration-200">
                      Edit
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-gray-600 hover:text-gray-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <p className="mb-2">{post.description}</p>

              {/* Render either a single image or image grid */}
              {post.image_paths.length === 1 ? (
  <img
    src={`https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${post.image_paths[0]}`}
    alt="Post"
    className="w-full h-64 object-cover rounded-lg mb-2 cursor-pointer"
    onClick={() => handleImageClick(post.image_paths)}
  />
) : (
  <div onClick={() => handleImageClick(post.image_paths)} className="cursor-pointer">
    {renderImageGrid(post.image_paths)}
  </div>
)}


              <div className="flex mt-4 justify-between text-sm mb-2">
                <p className="ml-3">{post.likesCount} Likes</p>
                <p>{post.comments ? post.comments.length : 0} Comments</p>
              </div>
              <hr className="mt-6 mb-2 border-gray-400 my-2" />

              <div className="flex mt-6 justify-between items-center ml-12">
                <div
                  onClick={() => handleLike(post.id, isLiked)}
                  className="cursor-pointer ml-3"
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIconOutline className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                <div onClick={() => handleCommentToggle(post.id)} className="cursor-pointer">
                  <ChatBubbleLeftIcon className="w-6 h-6 text-gray-500" />
                </div>

                <div className="cursor-pointer mr-12">
                  <ShareIcon className="w-6 h-6 text-gray-500" />
                </div>
              </div>

              {activeCommentPost === post.id && (
                <CommentPopup post={post} onClose={() => setActiveCommentPost(null)} />
              )}
            </div>
          );
        })
      )}
      {loading && <p>Loading more posts...</p>}

      {/* Render the ImageSlide modal */}
      <ImageSlide
        images={selectedImages}
        isOpen={isImageSlideOpen}
        onClose={() => setIsImageSlideOpen(false)}
      />

      {/* Render the EditPostModal when editing is triggered */}
      {isEditing && selectedPost && (
        <EditPostModal post={selectedPost} onClose={closeModal} />
      )}
    </div>
  );
};

export default PostCard;
