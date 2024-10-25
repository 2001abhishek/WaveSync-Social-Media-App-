"use client"
import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import moment from 'moment';

const USER_PROFILE_QUERY = gql`
  query UserProfile($user_id: ID!) {
    userProfile(user_id: $user_id) {
      avatar_path
      banner_path
      location
      about_user
      created_at
      user {
        name
        active_connections {
          id
          name
          userProfile {
            avatar_path
          }
        }
        posts {
          description
          image_path
          created_at
        }
      }
    }
  }
`;

const Page: React.FC = () => {
  const { id: userId } = useParams(); // Destructure `id` from params
  const { theme } = useUser();

  const { loading, error, data } = useQuery(USER_PROFILE_QUERY, {
    variables: { user_id: userId },
    skip: !userId,
  });

  if (loading) {
    return <p>Loading...</p>; // Placeholder UI while loading
  }

  if (error) {
    return <p>Error: {error.message}</p>; // Show error message if there's an error
  }

  if (!data) {
    return <p>No user data available.</p>; // Handle case where no data is returned
  }

  const userProfile = data.userProfile;
  const user = userProfile.user;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="relative h-[250px] w-full bg-gray-300">
        <Image
          src={userProfile?.banner_path
            ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.banner_path}`
            : "https://images.pexels.com/photos/28929970/pexels-photo-28929970/free-photo-of-welcome-sign-in-enchanted-woodland-setting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
          alt="Cover"
          layout="fill"
          objectFit="cover"
          className="rounded-b-lg"
        />
      </div>

      <div className="max-w-4xl mx-auto mt-6 p-4">
        <div className="flex items-center space-x-4">
          <Image
            src={userProfile?.avatar_path
              ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.avatar_path}`
              : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
            alt={user?.name || 'Profile Picture'}
            width={120}
            height={120}
            className="rounded-full pop-up"
          />
          <div>
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p>{moment(userProfile.created_at).format('LL')}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p>{userProfile.about_user}</p>
            <p>{userProfile.location}</p>
          </div>

          <div className="p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">Connections</h2>
            {user.active_connections.map((connection: any) => (
              <div key={connection.id} className="flex items-center space-x-2">
                <span>{connection.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>
          <div className="space-y-4">
            {user.posts.map((post: any) => (
              <div key={post.created_at} className="p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
                <p>{post.description}</p>
                {post.image_path && (
                  <Image 
                    src={`https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${post.image_path}`} 
                    alt="Post Image" 
                    width={500} 
                    height={300} 
                    className="mt-2" 
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">{moment(post.created_at).fromNow()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
