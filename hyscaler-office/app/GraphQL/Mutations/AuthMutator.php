<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use GraphQL\Error\Error;

class AuthMutator
{
    public function register($rootValue, array $args)
    {
        // Manual validation
    $errors = [];
    if (empty($args['name'])) {
        return[
            'status' => false,
            'message' => 'Name is required'
            
        ];
    }
    if (empty($args['email'])) {
        return[
            'status' => false,
            'message' => 'Email required'
            
        ];
    }
    if (empty($args['password'])) {
        return[
            'status' => false,
            'message' => 'Password is required'
            
        ];
    }

    if (!empty($errors)) {
        return[
            'status' => false,
            'message' => 'input should not be null'
            
        ];
    }

    // Additional validations
    if (!filter_var($args['email'], FILTER_VALIDATE_EMAIL)) {
        return[
            'status' => false,
            'message' => 'Email fromat error'
            
        ];
    }
    if (strlen($args['password']) < 6) {
        return[
                'status' => false,
                'message' => 'Password must be atleast 6 character'
                
            ];
    }
    if (User::where('email', $args['email'])->exists()) {
        return[
            'status' => false,
            'message' => 'Email already in use'
            
        ];
    }

    if (!empty($errors)) {
        throw new Error(implode(' ', $errors));
    }

    try {
        $user = User::create([
            'name' => $args['name'],
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
        ]);

        $token = JWTAuth::fromUser($user);

        return [
            'status' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ];
    } catch (\Exception $e) {
        throw new Error('An error occurred during registration.');
    }}

    public function login($rootValue, array $args)
    {
        // Manual validation
        if (empty($args['email'])) {
            // 
            return[
                'status' => false,
                'message' => 'Email required'
                
            ];
        }

        if (empty($args['password'])) {
            return[
                'status' => false,
                'message' => 'Password required'
            ];
        }

        $credentials = [
            'email' => $args['email'],
            'password' => $args['password'],
        ];

        if ($token = JWTAuth::attempt($credentials)) {
            $user = Auth::user();
            $user->activation_status = true;  // Set active on login
            $user->save();
        
            return [
                'status' => true,
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
            ];
        }
        

            
            return [
                'status' => false,
                'message' => 'invalid credential',
                'user'=> null,

            ];
    }
    public function logout()
{
    $user = Auth::user();
    $user->activation_status = false;  // Set inactive on logout
    $user->save();

    JWTAuth::invalidate(JWTAuth::getToken());

    return [
        'status' => true,
        'message' => 'Logout successful',
    ];
}

}   