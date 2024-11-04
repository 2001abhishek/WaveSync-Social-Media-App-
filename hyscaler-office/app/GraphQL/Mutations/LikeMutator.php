<?php

namespace App\GraphQL\Mutations;

use App\Models\UserPost;
use App\Models\UserLike;
use App\Models\UserComment;
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

        $likeData = [
            'user_id' => $user->id,
            'user_post_id' => $args['user_post_id'] ?? null,
            'user_comment_id' => $args['user_comment_id'] ?? null,
        ];

        // Validation to ensure at least one of user_post_id or user_comment_id is provided
        if (is_null($likeData['user_post_id']) && is_null($likeData['user_comment_id'])) {
            return [
                'status' => false,
                'message' => "Either user_post_id or user_comment_id is required",
            ];
        }

        DB::beginTransaction();

        try {
            // Determine the liked item
            $likedItem = null;
            if ($likeData['user_post_id']) {
                $likedItem = UserPost::findOrFail($likeData['user_post_id']);
            } elseif ($likeData['user_comment_id']) {
                $likedItem = UserComment::findOrFail($likeData['user_comment_id']);
            }

            // Toggle the like
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

            return [
                'status' => true,
                'message' => $message,
                'likedItem' => $likedItem,
                'liked' => $liked,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'status' => false,
                'message' => 'Failed to toggle like: ' . $e->getMessage(),
            ];
        }
    }
}
