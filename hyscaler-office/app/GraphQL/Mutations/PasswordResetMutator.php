<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Mail\SendOTP;
use Illuminate\Support\Facades\Mail;

class PasswordResetMutator
{
    public function forgotPassword($_, array $args)
    {
        $user = User::where('email', $args['email'])->first();

        if (!$user) {
            return [
                'status' => false,
                'message' => 'User not found',
            ];
        }

        $otp = sprintf("%06d", mt_rand(1, 999999));
        $user->otp = $otp;
        $user->validation_status = false;
        $user->save();

        Mail::to($user->email)->send(new SendOTP($otp));

        return [
            'status' => true,
            'message' => 'OTP sent successfully',
        ];
    }

    public function validateOTP($_, array $args)
    {
        $user = User::where('otp', $args['otp'])->first();

        if (!$user) {
            return [
                'status' => false,
                'message' => 'Invalid OTP',
            ];
        }

        $user->validation_status = true;
        $user->save();

        return [
            'status' => true,
            'message' => 'OTP validated successfully',
        ];
    }

    public function setNewPassword($_, array $args)
    {
        $user = User::where('email', $args['email'])->first();

        if (!$user) {
            return [
                'status' => false,
                'message' => 'User not found',
            ];
        }

        if (!$user->validation_status) { 
            return [
                'status' => false,
                'message' => 'OTP validation status false',
            ];         
        }

        if ($args['password'] !== $args['password_confirmation']) {
            return [
                'status' => false,
                'message' => 'Passwords do not match',
            ];  
        }

        $user->password = bcrypt($args['password']);
        $user->otp = null;
        $user->validation_status = false;
        $user->save();

        return [
            'status' => true,
            'message' => 'Password updated successfully',
        ];
    }
}