"use client";

import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Image from 'next/image';
import { useUser } from '@/app/context/UserContext';
import moment from 'moment';
import { PencilIcon, BriefcaseIcon, HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import EditProfileForm from '@/app/components/EditProfileForm';
import CreatePost from "../../components/CreatePost";
import FriendList from "../../components/FriendList";
import ImageSlide from "../../components/ImageSlide"
import ImageGrid from "../../components/ImageGrid"
import EditPostModal from '../../components/EditPostModal';



// GraphQL queries remain the same
const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      userProfile {
        avatar_path
        banner_path
        location
        about_user
        updated_at
      }
    }
  }
`;

const GET_USER_POSTS = gql`
  query UserPosts($userId: ID!) {
    userPosts(user_id: $userId) {
      id
      description
      image_paths
      created_at
    }
  }
`;

function Page() {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [userId, setUserId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
    skip: !userId,
  });
  const { data: postData, loading: postLoading, error: postError } = useQuery(GET_USER_POSTS, {
    variables: { userId },
    skip: !userId,
  });
  const { theme } = useUser();
  const [isImageSlideOpen, setIsImageSlideOpen] = useState(false);
const [selectedImages, setSelectedImages] = useState<string[]>([]);
// Add this handler in your Page component
const handleImageClick = (images: string[]) => {
  setSelectedImages(images);
  setIsImageSlideOpen(true);
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.replace('/pages/login');
    } else {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      setUserId(userInfo.id);
    }
  }, []);

  const user = data?.user;
  const userProfile = user?.userProfile;
  const handleUpdateSuccess = () => {
    refetch();
  };const SkeletonLoader = ({ type }: { type: string }) => {
    const skeletonClass = "bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg";
    
    switch (type) {
      case 'banner':
        return <div className="h-[250px] md:h-[348px] w-full bg-gray-300 dark:bg-gray-800 animate-pulse"></div>;
      case 'avatar':
        return <div className="h-[120px] w-[120px] md:h-[168px] md:w-[168px] bg-gray-300 dark:bg-gray-800 animate-pulse rounded-full"></div>;
      case 'text':
        return <div className={`h-4 w-2/3 ${skeletonClass} mt-2`}></div>;
      case 'intro':
        return (
          <div className={`p-4 ${skeletonClass}`}>
            <div className="space-y-3">
              <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-800"></div>
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-800"></div>
            </div>
          </div>
        );
      case 'post':
        return (
          <div className={`p-4 ${skeletonClass}`}>
            <div className="h-4 w-1/2 mb-2 bg-gray-300 dark:bg-gray-800"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-800"></div>
          </div>
        );
      default:
        return null;
    }
  };
  

  // Enhanced theme-based styling
  const themeStyles = {
    background: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    },
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    button: {
      primary: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
    }
  };
  const handleEditClick = (post: any) => {
    setSelectedPost(post);
    setIsEditing(true);
  };
  const closeModal = () => {
    setIsEditing(false);
    setSelectedPost(null);
    // Refetch posts after editing
    refetch();
  };
  

  if (loading || postLoading) return (
    <div className={`${themeStyles.background} min-h-screen`}>
      <div className="max-w-[1000px] mx-auto px-4 space-y-4">
        {/* Banner Skeleton */}
        <SkeletonLoader type="banner" />
        
        {/* Profile Skeleton */}
        <div className="relative -mt-16 pb-4 border-b">
          <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between">
            <SkeletonLoader type="avatar" />
            <div className="flex flex-col items-center md:ml-4 mt-4">
              <SkeletonLoader type="text" />
              <SkeletonLoader type="text" />
            </div>
          </div>
        </div>

        {/* Intro Section Skeleton */}
        <SkeletonLoader type="intro" />
        
        {/* Posts Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonLoader key={idx} type="post" />
          ))}
        </div>
      </div>
    </div>
  );

  
  if (error || postError) return (
    <div className={`flex justify-center items-center h-screen ${themeStyles.background} ${themeStyles.text.primary}`}>
      Error loading profile or posts.
    </div>
  );

  return (
    <div className={`${themeStyles.background} min-h-screen`}>
      {/* Cover Photo Section */}
      <div className="relative">
        <div className="relative h-[250px] md:h-[348px] w-full bg-gray-200">
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

        {/* Profile Info Section */}
        <div className="max-w-[1000px] mx-auto px-4">
          <div className={`relative -mt-16 pb-4 border-b ${themeStyles.border}`}>
            {/* Mobile Profile Layout */}
            <div className="flex flex-col items-center md:hidden">
              <div className="relative">
                <div className={`h-[120px] w-[120px] rounded-full ring-4 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'} overflow-hidden`}>
                  <Image
                    src={userProfile?.avatar_path
                      ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.avatar_path}`
                      : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                    alt={user?.name || 'Profile Picture'}
                    width={120}
                    height={120}
                    className="rounded-full pop-up"
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h1 className={`text-2xl font-bold ${themeStyles.text.primary}`}>{user?.name || 'Name not available'}</h1>
                <p className={themeStyles.text.muted}>1.2K friends</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`${themeStyles.button.primary} px-4 py-2 rounded-md font-semibold flex items-center gap-2`}
                >
                  <PencilIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Desktop Profile Layout */}
            <div className="hidden md:flex md:items-end md:justify-between">
              <div className="flex items-end">
                <div className="relative">
                  <div className={`h-[168px] w-[168px] rounded-full ring-4 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'} overflow-hidden`}>
                    <Image
                      src={userProfile?.avatar_path
                        ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${userProfile.avatar_path}`
                        : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                      alt={user?.name || 'Profile Picture'}
                      width={168}
                      height={168}
                      className="rounded-full pop-up"
                    />
                  </div>
                </div>
                <div className="ml-4 mb-4">
                  <h1 className={`text-3xl font-bold ${themeStyles.text.primary}`}>{user?.name || 'Name not available'}</h1>
                  <p className={themeStyles.text.muted}>1.2K friends</p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`${themeStyles.button.primary} px-4 py-2 rounded-md font-semibold flex items-center gap-2`}
                >
                  <PencilIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Main Content Area */}
          <div className="block md:hidden space-y-4 mt-4">
            {/* Intro Section */}
            <div className={`${themeStyles.card} rounded-lg p-4 shadow`}>
              <h2 className={`text-xl font-bold mb-4 ${themeStyles.text.primary}`}>Intro</h2>
              <div className="space-y-3">
                <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Works at {userProfile?.about_user || 'Not specified'}</span>
                </div>
                <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                  <HomeIcon className="h-5 w-5" />
                  <span>Lives in {userProfile?.location || 'Not specified'}</span>
                </div>
                <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Followed by 2.5K people</span>
                </div>
              </div>
            </div>

            {/* Friend List Section */}
            <div className={`${themeStyles.card} rounded-lg shadow h-[212px] overflow-auto custom-scrollbar`}>
              <FriendList />
            </div>

            {/* Create Post Section */}
            <div className={`${themeStyles.card} rounded-lg shadow h-[200px]`}>
              <CreatePost />
            </div>
          </div>

          {/* Desktop Main Content Area */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:mt-4 md:ml-[-110px]">
            <div className="col-span-4 h-[212px]">
              <div className={`${themeStyles.card} rounded-lg p-4 shadow h-full`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text.primary}`}>Intro</h2>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                    <BriefcaseIcon className="h-5 w-5" />
                    <span>Works at {userProfile?.about_user || 'Not specified'}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                    <HomeIcon className="h-5 w-5" />
                    <span>Lives in {userProfile?.location || 'Not specified'}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${themeStyles.text.secondary}`}>
                    <UserGroupIcon className="h-5 w-5" />
                    <span>Followed by 2.5K people</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 h-[200px]">
              <div className={`${themeStyles.card} rounded-lg shadow h-full`}>
                <CreatePost />
              </div>
            </div>

            <div className="col-span-3 h-[212px] w-96">
              <div className={`${themeStyles.card} rounded-lg shadow h-full overflow-auto custom-scrollbar`}>
                <FriendList />
              </div>
            </div>
          </div>

       {/* Posts Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
  {postData?.userPosts.map((post) => (
    <div key={post.id} className={`${themeStyles.card} rounded-lg p-4 shadow relative group`}>
      {/* Edit Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className="group flex items-center cursor-pointer hover:gap-2 transition-all duration-200"
          onClick={() => handleEditClick(post)}
        >
          <span className={`${themeStyles.text.secondary} max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[4rem] transition-all duration-200`}>
            Edit
          </span>
          <PencilIcon className={`${themeStyles.text.secondary} h-5 w-5 text-gray-600  dark:text-gray-400 `} />
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-4">
        <p className={`${themeStyles.text.muted} mb-2 text-sm md:text-base`}>
          {moment(post.created_at).fromNow()}
        </p>
        <p className={`${themeStyles.text.secondary} mb-2 text-sm md:text-base`}>
          {post.description}
        </p>
        {post.image_paths && Array.isArray(post.image_paths) && (
          <ImageGrid
            images={post.image_paths}
            onImageClick={handleImageClick}
            className="mt-2"
          />
        )}
      </div>
    </div>
  ))}
</div>

{/* Image Slide Modal */}
<ImageSlide
  images={selectedImages}
  isOpen={isImageSlideOpen}
  onClose={() => setIsImageSlideOpen(false)}
/>

{/* Edit Post Modal */}
{isEditing && selectedPost && (
  <EditPostModal 
    post={selectedPost} 
    onClose={closeModal}
  />
)}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <EditProfileForm
          currentProfile={userProfile}
          onClose={() => setIsEditMode(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}

export default Page;