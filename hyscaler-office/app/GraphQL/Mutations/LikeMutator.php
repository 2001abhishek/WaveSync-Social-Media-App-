<?php

namespace App\GraphQL\Mutations;

use App\Models\UserPost;
use App\Models\UserLike;
use Illuminate\Support\Facades\DB;

class LikeMutator
{
    public function toggle($rootValue, array $args, $context)
    {
        $user = $context->user();
        
        if (!$user) {
            return [
                'status' => false,
                'message' => "Unauthenticated",            
            ];
        }

        if (!isset($args['user_post_id'])) {
            return [
                'status' => false,
                'message' => "User post ID required",            
            ];
        }
        
        try {
            $post = UserPost::findOrFail($args['user_post_id']);
        
            $likeData = [
                'user_id' => $user->id,
                'user_post_id' => $args['user_post_id'],
            ];
        
            DB::beginTransaction();
        
            $like = UserLike::where($likeData)->first();
        
            if ($like) {
                $like->delete();
                $liked = false;
                $message = 'Like removed';
            } else {
                UserLike::create($likeData);
                $liked = true;
                $message = 'Liked successfully';
            }
        
            DB::commit();
        
            $post->refresh();
        
            return [
                'status' => true,
                'message' => $message,
                'likedItem' => $post, // Return the post model
                'liked' => $liked,
            ];
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return $this->errorResponse('Invalid ID provided: ' . $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to toggle like: ' . $e->getMessage());
        }
    }        
}