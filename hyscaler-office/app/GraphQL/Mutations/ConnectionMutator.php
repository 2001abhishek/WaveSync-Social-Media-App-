<?php

namespace App\GraphQL\Mutations;

use App\Models\UserConnection;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ConnectionMutator
{
    // Sending a friend request
    public function sendRequest($root, array $args)
    {
        $sender = Auth::user();
        if (!$sender) {
            return [
                'status' => false,
                'message' => 'User not authenticated.',
            ];
        }

        $receiver = User::findOrFail($args['receiver_id']);

        // Cannot send a friend request to oneself
        if ($sender->id === $receiver->id) {
            return [
                'status' => false,
                'message' => 'You cannot send a friend request to yourself.',
            ];
        }

        // Check for existing or mutual connection (sender or receiver could have already initiated the connection)
        $existingConnection = UserConnection::where(function ($query) use ($sender, $receiver) {
            $query->where('sender_id', $sender->id)->where('receiver_id', $receiver->id);
        })->orWhere(function ($query) use ($sender, $receiver) {
            $query->where('sender_id', $receiver->id)->where('receiver_id', $sender->id);
        })->first();

        // If a connection exists, check if it's pending or accepted
        if ($existingConnection) {
            if ($existingConnection->status) {
                return [
                    'status' => false,
                    'message' => 'You are already connected.',
                ];
            } else {
                return [
                    'status' => false,
                    'message' => 'A friend request is already pending.',
                ];
            }
        }

        // If no connection exists, create a new friend request
        UserConnection::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => false, // Pending status
        ]);

        return [
            'status' => true,
            'message' => 'Friend request sent successfully.',
        ];
    }

    // Responding to a friend request
    public function respondToRequest($root, array $args)
    {
        $user = Auth::user();
        if (!$user) {
            return [
                'status' => false,
                'message' => 'User not authenticated.',
            ];
        }

        // Find the connection where the user is the receiver, and it's still pending (status = false)
        $connection = UserConnection::where('id', $args['connection_id'])
            ->where('receiver_id', $user->id)
            ->where('status', false)
            ->first();

        // If the connection doesn't exist or the user is not authorized to respond to it
        if (!$connection) {
            return [
                'status' => false,
                'message' => 'Invalid connection ID or you are not authorized to respond to this request.',
            ];
        }

        // If the user accepts the friend request
        if ($args['accept']) {
            $connection->status = true; // Update the status to accepted
            $connection->save();
            return [
                'status' => true,
                'message' => 'Friend request accepted.',
            ];
        } else {
            // Reject the friend request (delete the pending connection)
            $connection->delete();
            return [
                'status' => true,
                'message' => 'Friend request rejected.',
            ];
        }
    }
    public function unfriend($root, array $args)
{
    $user = Auth::user();
    if (!$user) {
        return [
            'status' => false,
            'message' => 'User not authenticated.',
        ];
    }

    // Find the connection where either the user is the sender or receiver
    $connection = UserConnection::where(function ($query) use ($user, $args) {
        $query->where('sender_id', $user->id)
              ->where('receiver_id', $args['user_id']);
    })->orWhere(function ($query) use ($user, $args) {
        $query->where('receiver_id', $user->id)
              ->where('sender_id', $args['user_id']);
    })->first();

    // Validate the connection
    if (!$connection) {
        return [
            'status' => false,
            'message' => 'Connection not found or not authorized to unfriend this user.',
        ];
    }

    // Delete the connection
    $connection->delete();

    return [
        'status' => true,
        'message' => 'Successfully unfriended the user.',
    ];
}

}
