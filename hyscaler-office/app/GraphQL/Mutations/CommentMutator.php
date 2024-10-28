<?php

namespace App\GraphQL\Mutations;

use App\Models\UserComment;
use App\Models\UserPost;

class CommentMutator
{
    public function create($rootValue, array $args, $context)
    {
        $user = $context->user();
        
        if (!$user) {
            return $this->errorResponse('Unauthenticated');
        }

        if (!isset($args['user_post_id']) || empty($args['user_post_id'])) {
            return $this->errorResponse('Post ID required');
        }

        $post = UserPost::find($args['user_post_id']);

        if (!$post) {
            return $this->errorResponse('Post not found');
        }

        if (!isset($args['content']) || empty($args['content'])) {
            return $this->errorResponse('Comment content required');
        }

        $commentData = [
            'user_id' => $user->id,
            'user_post_id' => $post->id,
            'content' => $args['content'],
        ];

        if (isset($args['master_comment_id'])) {
            $masterComment = UserComment::find($args['master_comment_id']);
            if (!$masterComment) {
                return $this->errorResponse('Master comment not found');
            }
            $commentData['master_comment_id'] = $masterComment->id;
        }

        $comment = UserComment::create($commentData);

        // If it's a nested comment, return the master comment with its updated nested comments
        if (isset($args['master_comment_id'])) {
            $masterComment = UserComment::with('nestedComments')
                ->find($args['master_comment_id']);
            
            return [
                'status' => true,
                'message' => 'Nested comment created successfully',
                'comment' => $masterComment,
            ];
        }

        // For master comments, return the newly created comment
        return [
            'status' => true,
            'message' => 'Comment created successfully',
            'comment' => $comment->load('nestedComments'),
        ];
    }

    private function errorResponse($message)
    {
        return [
            'status' => false,
            'message' => $message,
            'comment' => null,
        ];
    }
}
