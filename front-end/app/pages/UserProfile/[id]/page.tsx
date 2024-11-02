"use client";
import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import moment from "moment";
import { UserPlusIcon, UserMinusIcon, ClockIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon} from "@heroicons/react/24/outline";
import ImageGrid from "@/app/components/ImageGrid";
import ImageSlide from "@/app/components/ImageSlide";
import CommentPopup from "@/app/components/CommentPopup";

// First, let's define proper TypeScript interfaces
interface UserProfile {
  avatar_path: string | null;
  banner_path: string | null;
  location: string | null;
  about_user: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    active_connections: Array<{
      id: string;
      name: string;
      userProfile: {
        avatar_path: string | null;
        about_user: string | null;
      };
    }>;
    posts: Array<{
      description: string;
      image_paths: string[];
      created_at: string;
    }>;
  };
}

interface UserContextType {
  theme: string;
  user: {
    id: string;
    name: string;
  } | null;
}

const USER_PROFILE_QUERY = gql`
  query UserProfile($user_id: ID!) {
    userProfile(user_id: $user_id) {
      avatar_path
      banner_path
      location
      about_user
      created_at
      user {
        id
        name
        active_connections {
          id
          name
          userProfile {
            avatar_path
            about_user
          }
        }
        posts {
          id
          description
          image_paths
          created_at
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
    }
  }
`;


const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($receiver_id: ID!) {
    sendFriendRequest(receiver_id: $receiver_id) {
      status
      message
    }
  }
`;

const UNFRIEND_MUTATION = gql`
  mutation Unfriend($user_id: ID!) {
    unfriend(user_id: $user_id) {
      status
      message
    }
  }
`;

const CANCEL_FRIEND_REQUEST_MUTATION = gql`
  mutation CancelFriendRequest($receiver_id: ID!) {
    cancelFriendRequest(receiver_id: $receiver_id) {
      status
      message
    }
  }
`;

const Page: React.FC = () => {
  const params = useParams();
  const userId = typeof params.id === 'string' ? params.id : params.id[0];
  const { theme, user } = useUser() as UserContextType;
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'connected' | 'pending'>('none');
  const [isImageSlideOpen, setIsImageSlideOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const s3BaseUrl = "https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/";
    const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);


// Toggle the comment section for a specific post
const handleCommentToggle = (postId: string) => {
  setActiveCommentPost(activeCommentPost === postId ? null : postId);
};

  const { loading, error, data, refetch } = useQuery(USER_PROFILE_QUERY, {
    variables: { user_id: userId },
    skip: !userId,
    onCompleted: (data) => {
      const isConnected = data.userProfile.user.active_connections.some(
        (conn: any) => conn.id === user?.id
      );
      setConnectionStatus(isConnected ? 'connected' : 'none');
    }
  });

  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST_MUTATION);
  const [unfriend, { loading: unfriending }] = useMutation(UNFRIEND_MUTATION);
  const [cancelRequest, { loading: canceling }] = useMutation(CANCEL_FRIEND_REQUEST_MUTATION);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No user data available.</p>;

  const userProfile: UserProfile = data.userProfile;

  const avatarUrl = userProfile.avatar_path
    ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.avatar_path}`
    : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";
  
  const bannerUrl = userProfile.banner_path
    ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.banner_path}`
    : "https://images.pexels.com/photos/28929970/pexels-photo-28929970/free-photo-of-welcome-sign-in-enchanted-woodland-setting.jpeg";

  const handleSendFriendRequest = async () => {
    try {
      const { data } = await sendFriendRequest({ 
        variables: { receiver_id: userId }
      });
      
      if (data.sendFriendRequest.status === "success") {
        setConnectionStatus("pending");
        await refetch();
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleUnfriend = async (targetUserId: string) => {
    try {
      const { data } = await unfriend({ 
        variables: { user_id: targetUserId }
      });
      
      if (data.unfriend.status === "success") {
        setConnectionStatus("none");
        await refetch();
      }
    } catch (err) {
      console.error("Error unfriending:", err);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const { data } = await cancelRequest({ 
        variables: { receiver_id: userId }
      });
      
      if (data.cancelFriendRequest.status === "success") {
        setConnectionStatus("none");
        await refetch();
      }
    } catch (err) {
      console.error("Error canceling request:", err);
    }
  };

  const ConnectionButton = () => {
    if (userId === user?.id) return null;

    switch (connectionStatus) {
      case "connected":
        return (
          <div
  onClick={() => handleUnfriend(userId)}
  className="flex items-center justify-center w-full max-w-xs mx-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer transition-colors duration-200"
>
  <UserMinusIcon className="w-5 h-5" />
  <span className="hidden md:inline">Remove Friend</span>
  <span className="md:hidden">Remove</span>
</div>

        );
      case "pending":
        return (
          <div
            onClick={handleCancelRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors duration-200"
          >
            <ClockIcon className="w-5 h-5" />
            <span>Cancel Request</span>
          </div>
        );
      default:
        return (
          <div
            onClick={handleSendFriendRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors duration-200"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Add Friend</span>
          </div>
        );
    }
  };
  const handleImageClick = (images: string[]) => {
    const fullImageUrls = images.map((path: string) => `${s3BaseUrl}${path}`);
    setSelectedImages(fullImageUrls);
    setIsImageSlideOpen(true);
  };
  

  return (
    <div className={`min-h-screen ${
      theme === "dark" 
        ? "bg-gray-900 text-gray-100" 
        : "bg-gray-50 text-gray-900"
    }`}>
      {/* Banner Section */}
      <div className="relative h-48 sm:h-[200px] w-full">
        <Image
          src={bannerUrl}
          alt="Cover"
          layout="fill"
          objectFit="cover"
          className="rounded-b-lg"
        />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center sm:items-end space-x-6">
            <div className={`relative w-32 h-32 rounded-full overflow-hidden ring-4 ${
              theme === "dark" ? "ring-gray-800" : "ring-white"
            } shadow-xl`}>
              <Image
                src={avatarUrl}
                alt={userProfile.user.name || "Profile Picture"}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className=" sm:mb-1">
              <h1 className="text-2xl font-bold mt-14">{userProfile.user.name}</h1>
              <p className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {moment(userProfile.created_at).format("LL")}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:mb-4">
            <ConnectionButton />
          </div>
        </div>
        {/* Info Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Section */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
              {userProfile.about_user || "No information available"}
            </p>
            <p className={`mt-3 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              {userProfile.location || "No location specified"}
            </p>
          </div>

          {/* Connections Section */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className="text-xl font-semibold mb-4">Connections</h2>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {userProfile.user.active_connections.map((connection) => (
                <div key={connection.id} className={`flex items-center space-x-4 py-3 border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                } last:border-b-0`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={connection.userProfile?.avatar_path
                        ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${connection.userProfile.avatar_path}`
                        : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                      alt={connection.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{connection.name}</p>
                    <p className={`text-sm truncate ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {connection.userProfile?.about_user || "No information available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProfile.user.posts.map((post) => (
            <div key={post.id} className={`rounded-xl p-6 shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } flex flex-col justify-between`}>
              <div>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } mb-3`}>
                  {moment(post.created_at).fromNow()}
                </p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
                  {post.description}
                </p>
                {post.image_paths && (
                  <ImageGrid
                    images={post.image_paths}
                    onImageClick={() => handleImageClick(post.image_paths)}
                    className="mt-4"
                  />
                )}
              </div>

              <div className="mt-4">
                <hr className={`my-3 ${
                  theme === "dark" ? "border-gray-200" : "border-gray-200"
                }`} />
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-800"
                  }`}>
                    {post.comments?.length || 0} Comments
                  </div>
                  <div 
        onClick={() => handleCommentToggle(post.id)} 
        className="cursor-pointer flex items-center"
      >
        <ChatBubbleLeftIcon 
          className={`w-6 h-6 ${
            theme === "dark" ? "text-white" : "text-black"
          }`} 
        />
      </div>
                </div>
              </div>

              {activeCommentPost === post.id && (
                <CommentPopup post={post} onClose={() => setActiveCommentPost(null)} />
              )}
            </div>
          ))}
        </div>

        <ImageSlide
          images={selectedImages}
          isOpen={isImageSlideOpen}
          onClose={() => setIsImageSlideOpen(false)}
        />
      </div>
    </div>
  );
};
export default Page;
