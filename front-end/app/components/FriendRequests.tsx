import React, { useState, useEffect } from 'react';
import {
  CheckIcon, XCircleIcon

  , CheckBadgeIcon

} from '@heroicons/react/24/solid';
import { useUser } from '../context/UserContext';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Toaster, toast } from 'sonner'; // Importing Sonner for toast messages

// Updated GraphQL Query
const GET_FRIEND_REQUESTS = gql`
  query Friend_Requests {
    Friend_Requests {
      id
      status
      created_at
      updated_at
      sender {
        id
        name
        userProfile {
          avatar_path
          location
          about_user
        }
      }
    }
  }
`;

const RESPOND_TO_FRIEND_REQUEST = gql`
  mutation RespondToFriendRequest($connectionId: ID!, $accept: Boolean!) {
    respondToFriendRequest(connection_id: $connectionId, accept: $accept) {
      status
      message
    }
  }
`;

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    userProfile: {
      avatar_path?: string;
      location?: string;
      about_user?: string;
    };
  };
  status: boolean;
}

const FriendRequests = () => {
  const { theme } = useUser();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Fetching friend requests using Apollo client
  const { data, loading, error, refetch } = useQuery(GET_FRIEND_REQUESTS);

  // Respond to friend request mutation
  const [respondToFriendRequest] = useMutation(RESPOND_TO_FRIEND_REQUEST);

  useEffect(() => {
    if (data) {
      console.log("Fetched data:", data);
      if (data.Friend_Requests) {
        setFriendRequests(data.Friend_Requests);
      }
    }
  }, [data]);

  const handleAccept = async (id: string) => {
    try {
      const { data } = await respondToFriendRequest({
        variables: {
          connectionId: id,
          accept: true, // Accept the friend request
        },
      });
      if (data.respondToFriendRequest.status) {
        toast.success('Friend request accepted!'); // Show success toast
        setFriendRequests(friendRequests.filter(request => request.id !== id));
      } else {
        toast.error(data.respondToFriendRequest.message);
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      toast.error('Error accepting friend request.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { data } = await respondToFriendRequest({
        variables: {
          connectionId: id,
          accept: false, // Reject the friend request
        },
      });
      if (data.respondToFriendRequest.status) {
        toast.success('Friend request rejected!'); // Show success toast on rejection
        setFriendRequests(friendRequests.filter(request => request.id !== id));
      } else {
        toast.error(data.respondToFriendRequest.message);
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      toast.error('Error rejecting friend request.');
    }
  };
  // Utility function to truncate the about_user text to 5 words
  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };


  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <li className="flex items-center animate-pulse">
      <div className="bg-gray-300 w-12 h-12 md:w-16 md:h-16 rounded-full mr-2 md:mr-4"></div>
      <div className="flex-1">
        <div className="bg-gray-300 h-4 w-24 mb-2 rounded"></div>
        <div className="bg-gray-300 h-3 w-40 mb-1 rounded"></div>
        <div className="bg-gray-300 h-3 w-32 rounded"></div>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6 ml-2">
        <div className="bg-gray-300 h-5 w-5 rounded"></div>
        <div className="bg-gray-300 h-5 w-5 rounded"></div>
      </div>
    </li>
  );
  if (error) {
    console.error("Error fetching friend requests:", error);
    return <p>Error fetching friend requests</p>;
  }

  return (
    <div className={`rounded-lg shadow-md p-4 h-[85vh] 
        w-full md:w-[24vw] ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-neutral-100 text-black'}`}> {/* Responsive width */}
        <h2 className="font-bold text-lg mb-2">Friend Requests</h2>
        <div className="max-h-full overflow-y-auto custom-scrollbar flex flex-col h-full">
            <ul className="space-y-8 w-full mt-8">
            {loading ? (
            // Render multiple skeleton loaders while loading
            Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
          ) : friendRequests.length > 0 ? (
            friendRequests.map((request) => {
              const avatarUrl = request.sender.userProfile?.avatar_path
                ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${request.sender.userProfile.avatar_path}`
                : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg';

                        return (
                            <li key={request.id} className="flex items-center">
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mr-2 md:mr-4" // Adjust avatar size for mobile
                                />
                                <div className="flex-1">
                                    <p className="font-semibold">{request.sender.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {request.sender.userProfile?.location || 'No location provided'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {request.sender.userProfile?.about_user
                                            ? truncateText(request.sender.userProfile.about_user, 5)
                                            : 'No bio provided'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 md:space-x-6 ml-2"> {/* Adjust space for mobile */}
                                    <div onClick={() => handleAccept(request.id)} className="cursor-pointer">
                                        <CheckBadgeIcon 
                                            className="h-4 w-4 md:h-5 md:w-5 text-blue-500 hover:text-green-700 transition duration-300" // Adjust icon size for mobile
                                        />
                                    </div>
                                    <div onClick={() => handleReject(request.id)} className="cursor-pointer">
                                        <XCircleIcon 
                                            className="h-4 w-4 md:h-5 md:w-5 text-red-500 hover:text-red-800 transition duration-300" // Adjust icon size for mobile
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <p>No friend requests found.</p>
                    </div>
                )}
            </ul>
        </div>
        <Toaster position="top-right" richColors />
    </div>
);
};

export default FriendRequests;


