"use client";
import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import moment from "moment";
import { UserIcon, ChatBubbleLeftIcon, UserPlusIcon, UserMinusIcon, ClockIcon } from "@heroicons/react/24/solid";

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
          description
          image_paths
          created_at
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
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer transition-colors duration-200"
          >
            <UserMinusIcon className="w-5 h-5" />
            <span>Remove Friend</span>
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

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="relative h-[200px] w-full bg-gray-300">
        <Image
          src={bannerUrl}
          alt="Cover"
          layout="fill"
          objectFit="cover"
          className="rounded-b-lg"
        />
      </div>

      <div className="max-w-[1000px] mx-auto mt-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg">
              <Image
                src={avatarUrl}
                alt={userProfile.user.name || "Profile Picture"}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{userProfile.user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{moment(userProfile.created_at).format("LL")}</p>
            </div>
          </div>
          <ConnectionButton />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700 dark:text-gray-300">{userProfile.about_user || "No information available"}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{userProfile.location || "No location specified"}</p>
          </div>

          <div className="p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">Connections</h2>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {userProfile.user.active_connections.map((connection) => {
                const connectionAvatarUrl = connection.userProfile?.avatar_path
                  ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${connection.userProfile.avatar_path}`
                  : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";

                return (
                  <div key={connection.id} className="flex items-center space-x-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={connectionAvatarUrl}
                        alt={connection.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{connection.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {connection.userProfile?.about_user || "No information available"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
