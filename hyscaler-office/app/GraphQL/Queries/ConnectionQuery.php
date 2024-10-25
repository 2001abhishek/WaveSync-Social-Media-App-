<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use App\Models\UserConnection;
use Illuminate\Support\Facades\Auth;

class ConnectionQuery
{
    public function getFriendRequests($root, array $args)
    {
        $user = Auth::user();
        if (!$user) {
            return [];
        }

        return UserConnection::where('receiver_id', $user->id)
            ->where('status', false)
            ->with('sender')
            ->get();
    }

    public function getFriendSuggestions()
    {
        $user = Auth::user();
        if (!$user) {
            return [];
        }

        // Get IDs of existing friends and pending requests
        $existingConnectionIds = UserConnection::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })->pluck('sender_id')
          ->merge(UserConnection::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
          })->pluck('receiver_id'))
          ->unique()
          ->values();

        // Exclude the user themselves
        $existingConnectionIds[] = $user->id;

        // Get users who are not connected and not the user themselves
        $suggestedFriends = User::whereNotIn('id', $existingConnectionIds)
            ->inRandomOrder()
            ->limit(10)  // Limit to 10 suggestions, you can adjust this
            ->get();

        return $suggestedFriends;
    }

    // New method to get all accepted connections
    public function getAllConnections($root, array $args)
    {
        // Retrieve all connections with status true
        return UserConnection::where('status', true)
            ->with(['sender', 'receiver']) // Eager load sender and receiver
            ->get();
    }
    public function getActiveConnections($root, array $args)
    {
        // If this is a nested query, $root will be the User object
        if ($root) {
            $user_id = $root->id;
        } else {
            // Otherwise, the user_id should be passed in the arguments
            if (!isset($args['user_id'])) {
                throw new \Exception("User ID is required.");
            }
            $user_id = $args['user_id'];
        }

        // Fetch the user and check if they exist
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found.");
        }

        // Fetch the active connections for the user
        return UserConnection::where(function ($query) use ($user_id) {
            $query->where('sender_id', $user_id)
                  ->orWhere('receiver_id', $user_id);
        })
        ->where('status', true) // Only active connections
        ->with(['sender', 'receiver']) // Eager load relationships
        ->get()
        ->map(function ($connection) use ($user_id) {
            // Return the other user in the connection
            return $connection->sender_id == $user_id
                ? $connection->receiver
                : $connection->sender;
        });
    }
    public function activeConnectionsAuth($root, array $args)
{
    // Get the authenticated user
    $user = Auth::user();

    // Check if the user is logged in
    if (!$user) {
        throw new \Exception("Unauthenticated.");
    }

    // Fetch active connections for the authenticated user
    return UserConnection::where(function ($query) use ($user) {
        $query->where('sender_id', $user->id)
              ->orWhere('receiver_id', $user->id);
    })
    ->where('status', true) // Only active connections
    ->with(['sender', 'receiver']) // Eager load relationships
    ->get()
    ->map(function ($connection) use ($user) {
        // Return the other user in the connection
        return $connection->sender_id == $user->id
            ? $connection->receiver
            : $connection->sender;
    });
}



}
