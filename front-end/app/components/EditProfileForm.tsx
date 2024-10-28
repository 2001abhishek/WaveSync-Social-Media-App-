import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/outline';

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($avatar: Upload, $banner: Upload, $location: String, $about_user: String) {
    updateUserProfile(avatar: $avatar, banner: $banner, location: $location, about_user: $about_user) {
      status
      message
      userProfile {
        id
        avatar_path
        banner_path
        location
        about_user
      }
    }
  }
`;

interface EditProfileFormProps {
  currentProfile: any; // Replace `any` with a proper type if possible
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const EditProfileForm = ({ currentProfile, onClose, onUpdateSuccess }: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    location: currentProfile?.location || '',
    about_user: currentProfile?.about_user || '',
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result as string);
        } else {
          setBannerFile(file);
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await updateProfile({
        variables: {
          avatar: avatarFile || null, // Use existing avatar if no new file is provided
          banner: bannerFile || null, // Use existing banner if no new file is provided
          location: formData.location || null,
          about_user: formData.about_user || null,
        },
      });

      if (data.updateUserProfile.status) {
        onUpdateSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <div
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="cursor-pointer h-6 w-6" />
        </div>

        <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-white">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'avatar')}
              className="mt-1"
            />
            {avatarPreview && (
              <img src={avatarPreview} alt="Avatar preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white">Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
              className="mt-1"
            />
            {bannerPreview && (
              <img src={bannerPreview} alt="Banner preview" className="mt-2 h-32 w-full object-cover rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white">About</label>
            <textarea
              value={formData.about_user}
              onChange={(e) => setFormData({ ...formData, about_user: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
