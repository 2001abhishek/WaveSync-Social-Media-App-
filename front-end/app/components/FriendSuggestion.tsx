import React, { useEffect, useState } from "react";
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { useUser } from "../context/UserContext"; 
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';

// GraphQL query to fetch friend suggestions
const FRIEND_SUGGESTIONS_QUERY = gql`
  query FriendSuggestions {
    friendSuggestions {
      id
      name
      userProfile {
        avatar_path
        location
        about_user
      }
    }
  }
`;

// GraphQL mutation to send friend request
const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiver_id: $receiverId) {
      status
      message
    }
  }
`;

// TypeScript types for the friend suggestion data
interface UserProfile {
  avatar_path: string;
  location: string;
  about_user: string;
}

interface FriendSuggestionData {
  id: number;
  name: string;
  userProfile: UserProfile;
}

const FriendSuggestion = () => {
  const { theme } = useUser();
  const [suggestions, setSuggestions] = useState<FriendSuggestionData[]>([]); // Store friend suggestions
  const [loadedSuggestions, setLoadedSuggestions] = useState<number[]>([]);
  const router = useRouter();

  // Fetch friend suggestions using Apollo Client
  const { data, loading, error } = useQuery(FRIEND_SUGGESTIONS_QUERY, {
    onCompleted: (data) => {
      setSuggestions(data.friendSuggestions); // Initialize suggestions state
    }
  });

  // Mutation to send friend request
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST_MUTATION, {
    onCompleted: (data) => {
      if (data.sendFriendRequest.status) {
        toast.success("Sent friend request"); // Success toast
      } else {
        toast.error("Failed to send friend request"); // Error toast
      }
    }
  });

  // Handle friend request action
  const handleSendRequest = (receiverId: number) => {
    sendFriendRequest({ variables: { receiverId } });

    // Remove the user from suggestions once the friend request is sent
    setSuggestions((prevSuggestions) =>
      prevSuggestions.filter((suggestion) => suggestion.id !== receiverId)
    );
  };

  const navigateToProfile = (userId: number) => {
    router.push(`/pages/UserProfile/${userId}`);
  };

  useEffect(() => {
    if (data && data.friendSuggestions) {
      const timerIds: number[] = data.friendSuggestions.map((suggestion: FriendSuggestionData, index: number) => {
        return setTimeout(() => {
          setLoadedSuggestions((prev) => [...prev, suggestion.id]);
        }, index * 300); // Stagger the animation by 300ms per item
      });
  
      // Cleanup timeouts with explicit type for 'id'
      return () => {
        timerIds.forEach((id: number) => clearTimeout(id));
      };
    }
  }, [data]);

  if (loading) {
    return (
      <div className={`rounded-lg shadow-md h-[85vh] w-full md:w-[24vw] p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-neutral-100'}`}>
        <h2 className="font-bold text-lg mb-2">Friend Suggestions</h2>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          <ul className="space-y-8">
            {/* Array of placeholders to simulate skeleton loading */}
            {Array(5).fill(0).map((_, index) => (
              <li key={index} className="flex items-center animate-pulse">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-300 mr-2"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="w-40 h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-2">
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error) return <p>Error loading suggestions.</p>;

  return (
    <div className={`rounded-lg shadow-md h-[85vh] 
      w-full md:w-[24vw] p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-neutral-100 text-black'}`}> {/* Responsive width */}
      <h2 className="font-bold text-lg mb-2">Friend Suggestions</h2>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar fade-in-bottom">
        <ul className="space-y-8">
          {suggestions.map((suggestion: FriendSuggestionData) => (
            <li
              key={suggestion.id}
              className={`flex items-center ${loadedSuggestions.includes(suggestion.id) ? 'fade-in' : ''}`}
              style={{ transitionDelay: `${loadedSuggestions.includes(suggestion.id) ? 0 : 300}ms` }}
            >
              <img
                src={`https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${suggestion.userProfile?.avatar_path}`}
                alt={`${suggestion.name}'s avatar`}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full mr-2 object-cover cursor-pointer"
                onClick={() => navigateToProfile(suggestion.id)} // Navigate on avatar click
              />
              <div className="flex-1 cursor-pointer" onClick={() => navigateToProfile(suggestion.id)}> {/* Navigate on name click */}
                <p className="font-semibold">{suggestion.name}</p>
                <p className={`truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {suggestion.userProfile?.about_user.split(" ").slice(0, 4).join(" ") + 
                  (suggestion.userProfile?.about_user.split(" ").length > 4 ? "..." : "")}
                </p>
                <p>{suggestion.userProfile?.location}</p>
              </div>
              <div className="flex items-center space-x-4 md:space-x-8 ml-2"> {/* Adjust spacing for mobile */}
                <UserPlusIcon
                  className="h-4 w-4 md:h-5 md:w-5 text-green-500 cursor-pointer" // Adjust icon size for mobile
                  onClick={() => handleSendRequest(suggestion.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendSuggestion;
