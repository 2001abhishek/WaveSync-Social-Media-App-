<?php
namespace App\GraphQL\Mutations;

use App\Models\UserProfile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserProfileMutator
{
    public function update($rootValue, array $args, $context)
    {
        $user = Auth::user();
        
        if (!$user) {
            return [
                'status' => false,
                'message' => "Unauthenticated",
                'userProfile' => null
            ];
        }
    
        // Retrieve the user's profile or create one if it doesn't exist
        $userProfile = UserProfile::firstOrCreate(['user_id' => $user->id]);

        // Handle avatar upload
        if (isset($args['avatar'])) {
            // Delete the old avatar from S3 if it exists and a new avatar is provided
            if ($userProfile->avatar_path && $args['avatar']) {
                Storage::disk('s3')->delete($userProfile->avatar_path);
            }

            // If a new avatar file is provided, handle the upload
            if ($args['avatar']) {
                $avatar = $args['avatar'];
                $avatarFilename = Str::random(40) . '.' . $avatar->getClientOriginalExtension();
                $avatarPath = 'profile/avatar/' . $avatarFilename;
                Storage::disk('s3')->put($avatarPath, file_get_contents($avatar));
                $userProfile->avatar_path = $avatarPath; // Update avatar path
            }
            // If no new avatar is provided, keep the existing avatar path
        }

        // Handle banner upload
        if (isset($args['banner'])) {
            // Delete the old banner from S3 if it exists and a new banner is provided
            if ($userProfile->banner_path && $args['banner']) {
                Storage::disk('s3')->delete($userProfile->banner_path);
            }

            // If a new banner file is provided, handle the upload
            if ($args['banner']) {
                $banner = $args['banner'];
                $bannerFilename = Str::random(40) . '.' . $banner->getClientOriginalExtension();
                $bannerPath = 'profile/banner/' . $bannerFilename;
                Storage::disk('s3')->put($bannerPath, file_get_contents($banner));
                $userProfile->banner_path = $bannerPath; // Update banner path
            }
            // If no new banner is provided, keep the existing banner path
        }

        // Update other fields, allowing null values
        $userProfile->location = $args['location'] ?? $userProfile->location;
        $userProfile->about_user = $args['about_user'] ?? $userProfile->about_user;

        $userProfile->save();
    
        return [
            'status' => true,
            'message' => "Profile updated successfully",
            'userProfile' => $userProfile
        ];
    }

    public function delete($rootValue, array $args)
    {
        $user = Auth::user();

        if (!$user) {
            return [
                'status' => false,
                'message' => "Unauthenticated"
            ];
        }

        $userProfile = UserProfile::where('user_id', $user->id)->first();

        if (!$userProfile) {
            return [
                'status' => false,
                'message' => "Profile not found"
            ];
        }

        // Delete avatar and banner from S3
        if ($userProfile->avatar_path) {
            Storage::disk('s3')->delete($userProfile->avatar_path);
        }
        
        if ($userProfile->banner_path) {
            Storage::disk('s3')->delete($userProfile->banner_path);
        }

        $userProfile->delete();

        return [
            'status' => true,
            'message' => "Profile deleted successfully"
        ];
    }
}

