<?php

namespace App\GraphQL\Mutations;

use App\Models\UserLike;
use App\Models\UserPost;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserPostMutator
{
    //...........Create Post..............//
    public function create($rootValue, array $args, $context)
{
    $user = $context->user();
    if (!$user) {
        return ['status' => false, 'message' => "Unauthenticated", 'userPost' => null];
    }
    
    if (!isset($args['description']) || empty($args['description']) || !isset($args['images']) || count($args['images']) < 1) {
        return ['status' => false, 'message' => "Description and at least one image are required", 'userPost' => null];
    }

    $paths = [];
    foreach ($args['images'] as $image) {
        $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
        $path = 'posts/' . $filename;
        Storage::disk('s3')->put($path, file_get_contents($image));
        $paths[] = $path;
    }

    $userPost = UserPost::create([
        'user_id' => $user->id,
        'description' => $args['description'],
        'image_paths' => $paths, // Store all paths as an array
    ]);

    return ['status' => true, 'message' => 'User post created successfully', 'userPost' => $userPost];
}

    

    //...........Update Post..............//
    public function update($rootValue, array $args)
{
    $user = Auth::user();
    if (!$user) {
        return ['status' => false, 'message' => "Unauthenticated", 'userPost' => null];
    }
    
    $userPost = UserPost::find($args['id']);
    if (!$userPost || $userPost->user_id !== $user->id) {
        return ['status' => false, 'message' => "Post not found or unauthorized", 'userPost' => null];
    }

    $paths = $userPost->image_paths ?? [];
    if (isset($args['images']) && count($args['images']) > 0) {
        // Delete old images if needed
        foreach ($paths as $path) {
            Storage::disk('s3')->delete($path);
        }
        
        // Upload new images
        $paths = [];
        foreach ($args['images'] as $image) {
            $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
            $path = 'posts/' . $filename;
            Storage::disk('s3')->put($path, file_get_contents($image));
            $paths[] = $path;
        }
    }

    $userPost->fill([
        'description' => $args['description'] ?? $userPost->description,
        'image_paths' => $paths,
    ])->save();

    return ['status' => true, 'message' => "Post updated successfully", 'userPost' => $userPost];
}


        //...........Delete Post..............//
        public function delete($rootValue, array $args)
        {
            $user = Auth::user();
        
            if (!$user) {
                return [
                    'status' => false,
                    'message' => "Unauthenticated"
                ];
            }
        
            if (!isset($args['id']) || empty($args['id'])) {
                return [
                    'status' => false,
                    'message' => "Post ID is required"
                ];
            }
        
            $userPost = UserPost::find($args['id']);
        
            if (!$userPost || $userPost->user_id !== $user->id) {
                return [
                    'status' => false,
                    'message' => "Post not found or unauthorized"
                ];
            }
        
            // Delete the image from S3
            Storage::disk('s3')->delete($userPost->image_path);
        
            // Delete the post from the database
            $userPost->delete();
        
            return [
                'status' => true,
                'message' => "Post deleted successfully"
            ];
        }
            //...........Check if Liked..............//
    public function liked($root, $args, $context)
    {
        $user = $context->user();

        if (!$user) {
            return false;
        }

        return UserLike::where('user_id', $user->id)
            ->where('user_post_id', $root->id)
            ->exists();
    }
}
