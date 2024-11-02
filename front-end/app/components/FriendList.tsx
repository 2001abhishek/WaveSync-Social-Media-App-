import React, { useEffect, useState } from "react";
import { ChatBubbleLeftRightIcon, UserMinusIcon } from '@heroicons/react/24/solid';
import { useUser } from "../context/UserContext";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useRouter } from 'next/navigation';



// GraphQL query to fetch active connections
const ACTIVE_CONNECTIONS_QUERY = gql`
  query ActiveConnectionsAuth {
    active_connections_auth {
      id
      name
      email
      activation_status
      userProfile {
        avatar_path
        location
        about_user
      }
    }
  }
`;

// GraphQL mutation to unfriend
const UNFRIEND_MUTATION = gql`
  mutation Unfriend($userId: ID!) {
    unfriend(user_id: $userId) {
      status
      message
    }
  }
`;

const FriendList: React.FC = () => {
  const { theme } = useUser();
  const [loadedFriends, setLoadedFriends] = useState<number[]>([]);
  const [friendsData, setFriendsData] = useState<any[]>([]); // State for friends data
  const router = useRouter();


  // Fetch active connections using Apollo Client
  const { data, loading, error, refetch } = useQuery(ACTIVE_CONNECTIONS_QUERY);

  // Unfriend mutation
  const [unfriend] = useMutation(UNFRIEND_MUTATION, {
    onCompleted: (data) => {
      if (data.unfriend.status) {
        refetch(); // Refetch friends list after successful unfriend
      } else {
        alert("Failed to unfriend.");
      }
    }
  });
  const navigateToProfile = (userId: string) => {
    router.push(`/pages/UserProfile/${userId}`);
  };

  // Handle unfriend action
  const handleUnfriend = (userId: string) => {
    unfriend({ variables: { userId } });
  };

  useEffect(() => {
    if (data && data.active_connections_auth) {
      setFriendsData(data.active_connections_auth);
    }
  }, [data]);

  useEffect(() => {
    const timerIds = friendsData.map((friend: any, index: number) => {
      return setTimeout(() => {
        setLoadedFriends((prev) => [...prev, friend.id]); // Add friend id to the loaded list after delay
      }, index * 300); // Stagger the animation by 300ms per item
    });

    // Cleanup: clear timeouts when component is unmounted or friendsData changes
    return () => {
      timerIds.forEach((id) => clearTimeout(id));
    };
  }, [friendsData]);
  const renderSkeleton = () => (
    <div className="animate-pulse flex items-center space-x-4">
      <div className="rounded-full bg-gray-300 h-8 w-8 md:h-10 md:w-10" />
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );


  if (loading) {
    // Render skeleton while loading
    return (
      <div className={`rounded-lg h-[85vh] shadow-md p-4 
        ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-neutral-100 text-black'} 
        w-full md:w-[23vw]`}
      >
        <h2 className="font-bold text-lg mb-2">Friends</h2>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          <ul className="space-y-8">
            {Array(5).fill(0).map((_, idx) => (
              <li key={idx}>{renderSkeleton()}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error) return <p>Error loading friends.</p>;

  return (
    <div className={`rounded-lg h-[85vh] shadow-md p-4 
        ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-neutral-100 text-black'} 
        w-full md:w-[23vw]`} // Adjust width for mobile and desktop
    >
      <h2 className="font-bold text-lg mb-2">Friends</h2>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <ul className="space-y-8">
          {friendsData.map((friend: any) => {

            const avatar = friend.userProfile?.avatar_path
              ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${friend.userProfile.avatar_path}`
              : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg';
            
            const about = friend.userProfile?.about_user 
              ? friend.userProfile.about_user.length > 27
                ? friend.userProfile.about_user.slice(0, 27) + "..."
                : friend.userProfile.about_user
              : "No information available";

            return (
              <li
                key={friend.id}
                className={`flex items-center ${loadedFriends.includes(friend.id) ? 'fade-in-bottom' : ''}`}
                style={{ transitionDelay: `${loadedFriends.includes(friend.id) ? 0 : 300}ms` }}
              >
                <img 
                onClick={() => navigateToProfile(friend.id)}
                  src={avatar} 
                  alt={`${friend.name}'s avatar`} 
                  className="cursor-pointer h-8 w-8 md:h-10 md:w-10 rounded-full mr-2 object-cover" // Adjust avatar size for mobile
                />
                <div className="flex-1 cursor-pointer">
                  <p className="font-semibold"
                                  onClick={() => navigateToProfile(friend.id)}
                                  >{friend.name}</p>
                  <p
                                  onClick={() => navigateToProfile(friend.id)}
                                  className={`truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{about}</p>
                  <p className="text-sm flex items-center">
                    {friend.activation_status ? (
                      <span className="text-green-500 text-sm flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1" /> Online
                      </span>
                    ) : (
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'}`}>
                        Last active: {new Date().toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4 ml-2"> {/* Reduced space for mobile */}
                  <UserMinusIcon
                    className="h-4 w-4 md:h-5 md:w-5 text-red-500 cursor-pointer" // Adjust icon size for mobile
                    onClick={() => handleUnfriend(friend.id)}
                  />
                  <ChatBubbleLeftRightIcon 
                    className="h-4 w-4 md:h-5 md:w-5 text-blue-500 cursor-pointer" // Adjust icon size for mobile
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FriendList;
