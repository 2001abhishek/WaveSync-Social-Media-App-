"use client";
import React from "react";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

// GraphQL mutations
const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      status
      message
    }
  }
`;

const VALIDATE_OTP_MUTATION = gql`
  mutation ValidateOTP($otp: String!) {
    validateOTP(otp: $otp) {
      status
      message
    }
  }
`;

const SET_NEW_PASSWORD_MUTATION = gql`
  mutation SetNewPassword(
    $email: String!
    $password: String!
    $password_confirmation: String!
  ) {
    setNewPassword(
      email: $email
      password: $password
      password_confirmation: $password_confirmation
    ) {
      status
      message
    }
  }
`;

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP, Step 3: Set new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const router = useRouter();

  const [forgotPassword] = useMutation(FORGOT_PASSWORD_MUTATION);
  const [validateOTP] = useMutation(VALIDATE_OTP_MUTATION);
  const [setNewPassword] = useMutation(SET_NEW_PASSWORD_MUTATION);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await forgotPassword({ variables: { email } });
      if (data.forgotPassword.status) {
        toast.success(data.forgotPassword.message);
        setStep(2); // Move to Step 2: Enter OTP
      } else {
        toast.error(data.forgotPassword.message);
      }
    } catch (err) {
      toast.error("Failed to send OTP.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await validateOTP({ variables: { otp } });
      if (data.validateOTP.status) {
        toast.success(data.validateOTP.message);
        setStep(3); // Move to Step 3: Set new password
      } else {
        toast.error(data.validateOTP.message);
      }
    } catch (err) {
      toast.error("Invalid OTP.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await setNewPassword({
        variables: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      if (data.setNewPassword.status) {
        toast.success(data.setNewPassword.message);
        setTimeout(() => {
          router.push("/pages/login"); // Redirect to login page after success
        }, 2000); // Redirect after 2 seconds
      } else {
        toast.error(data.setNewPassword.message);
      }
    } catch (err) {
      toast.error("Failed to reset password.");
    }
  };

  return (
    <div>
      <Toaster position="top-right" richColors />
      {step === 1 && (
       <form onSubmit={handleEmailSubmit} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
       <h2 className="text-xl font-bold mb-4">Find Your Account</h2>
       <p className="text-sm text-gray-600 mb-4">
         Please enter your email address or mobile number to search for your account.
       </p>
       <input
         type="text"
         placeholder="Email address "
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         required
         className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
       />
       <div className="flex justify-end">
         <button 
           type="button" 
           className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
         >
           Cancel
         </button>
         <button 
           type="submit" 
           className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
           Search
         </button>
       </div>
     </form>
      )}
      {step === 2 && (
        <form 
  onSubmit={handleOtpSubmit} 
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto"
>
  <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
  <p className="text-sm text-gray-600 mb-4">
    Please enter the OTP sent to your email address to verify your identity.
  </p>
  <input
    type="text"
    placeholder="Enter OTP"
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <div className="flex justify-end">
    <button 
      type="button" 
      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      Cancel
    </button>
    <button 
      type="submit" 
      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Validate OTP
    </button>
  </div>
</form>      )}
      {step === 3 && (
        <form 
  onSubmit={handlePasswordSubmit} 
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-6"
>
  <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
  <p className="text-sm text-gray-600 mb-4">
    Please enter your new password below.
  </p>
  <input
    type="password"
    placeholder="Enter new password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <input
    type="password"
    placeholder="Confirm new password"
    value={passwordConfirmation}
    onChange={(e) => setPasswordConfirmation(e.target.value)}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <div className="flex justify-end">
    <button 
      type="button" 
      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      Cancel
    </button>
    <button 
      type="submit" 
      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Set New Password
    </button>
  </div>
</form>
    )}
    </div>
  );
};

export default ForgetPassword;
