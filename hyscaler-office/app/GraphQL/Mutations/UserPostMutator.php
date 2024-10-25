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
    foreach ($args['images'] as $index => $image) {
        $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
        $path = 'posts/' . $filename;
        Storage::disk('s3')->put($path, file_get_contents($image));
        $paths[] = $path;
    }

    $userPost = UserPost::create([
        'user_id' => $user->id,
        'description' => $args['description'],
        'image_path' => $paths[0],
        'image_path2' => $paths[1] ?? null,
        'image_path3' => $paths[2] ?? null,
        'image_path4' => $paths[3] ?? null,
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

    $paths = [$userPost->image_path, $userPost->image_path2, $userPost->image_path3, $userPost->image_path4];
    if (isset($args['images']) && count($args['images']) > 0) {
        foreach ($args['images'] as $index => $image) {
            if ($index < 4 && !empty($paths[$index])) {
                Storage::disk('s3')->delete($paths[$index]);
            }
            $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
            $paths[$index] = 'posts/' . $filename;
            Storage::disk('s3')->put($paths[$index], file_get_contents($image));
        }
    }

    $userPost->fill(['description' => $args['description'] ?? $userPost->description, 'image_path' => $paths[0], 'image_path2' => $paths[1], 'image_path3' => $paths[2], 'image_path4' => $paths[3]])->save();

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
