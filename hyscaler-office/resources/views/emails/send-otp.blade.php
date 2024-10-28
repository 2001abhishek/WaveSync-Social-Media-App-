<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
        }
        .content {
            line-height: 1.6;
            margin-top: 20px;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset OTP</h1>

        <p>Hello,</p>

        <div class="content">
            <p>Your OTP for password reset is:</p>
            <p class="otp">{{ $otp }}</p>
            <p>This OTP will expire in 15 minutes. Please use it to reset your password.</p>
        </div>

        <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
            <p>Thank you,<br>{{ config('app.name') }} Team</p>
        </div>
    </div>
</body>
</html>
