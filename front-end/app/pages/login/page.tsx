"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useUser } from '../../context/UserContext';
import { toast, Toaster } from "sonner"; // Import Sonner for notifications

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      message
      token
      user {
        id
        name
        email
        userProfile {
          avatar_path
        }
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      status
      message
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const AuthPage = () => {
  const router = useRouter();
  const { login: setUserLogin } = useUser();

  // State to toggle between login and signup
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [login, { data: loginData, loading: loginLoading, error: loginError }] = useMutation(LOGIN_MUTATION);
  const [register, { data: registerData, loading: registerLoading, error: registerError }] = useMutation(REGISTER_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({
        variables: { email: formData.email, password: formData.password },
      });
  
      if (response.data.login.status) {
        const user = response.data.login.user; // Ensure this includes userProfile
  
        // Store token and user info in localStorage
        localStorage.setItem("token", response.data.login.token);
        localStorage.setItem("user", JSON.stringify(user)); // Ensure user includes userProfile
  
        // Update context user state
        setUserLogin(user);
  
        // Redirect to feed page
        router.push("/pages/feed");
      } else {
        console.error(response.data.login.message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register({
        variables: { name: formData.name, email: formData.email, password: formData.password },
      });
  
      if (response.data.register.status) {
        localStorage.setItem("token", response.data.register.token);
        localStorage.setItem("user", JSON.stringify(response.data.register.user));
        
        // Update the user context
        setUserLogin(response.data.register.user);
        
        toast.success("Signup successful!");
        router.push("/pages/feed");
      } else {
        toast.error(response.data.register.message);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    }
  };
  

  return (
    <div className="flex flex-col md:flex-row items-center p-4 md:p-48 justify-center min-h-screen bg-gray-100">
    {/* Left side */}
<div className="w-full md:w-1/2 p-6 text-center md:text-left mb-8 md:mb-0">
  {/* Image instead of h1 */}
  <img
    src="/assets/ScalerWhiteMode.png"
    alt="ScaleWave Logo"
    className="w-auto h-16 md:h-20 mb-4 fade-in-left" // Adjust height based on screen size
  />
  <p className="text-xl text-gray-700 ">
    WaveSync helps you connect and share <br className="hidden md:inline" /> with the people in your life.
  </p>
</div>


      {/* Right side: Form section */}
      <div className="w-full md:w-1/2 max-w-md">
  <Toaster /> {/* For toast notifications */}
  <div className="bg-neutral-100 rounded-lg shadow-md p-6">
    {/* Logo section */}
    <div className="flex justify-center">
     <img
    src="/assets/ScalerWhiteMode.png"
    alt="ScaleWave Logo"
    className="w-auto h-16 md:h-20 mb-4" // Adjust height based on screen size
  />
    </div>

    {/* Conditional form for login/signup */}
    {isLogin ? (
      <form onSubmit={handleLoginSubmit} className="flex flex-col items-center">
        {/* Login form inputs */}
        <div className="mb-4 w-full">
          <input
            type="email"
            name="email"
            placeholder="Email address "
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6 w-full">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Log in
        </button>
        {loginError && (
          <p className="mt-4 text-red-500 text-center">
            {loginError.message}
          </p>
        )}
        {loginData && !loginData.login.status && (
          <p className="mt-4 text-red-500 text-center">
            {loginData.login.message}
          </p>
        )}
      </form>
    ) : (
      <form onSubmit={handleSignupSubmit} className="flex flex-col items-center">
        {/* Signup form inputs */}
        <div className="mb-4 w-full">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4 w-full">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6 w-full">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Informational text */}
        <p className="text-xs text-gray-500 mb-4 text-left w-full">
          People who use our service may have uploaded your contact information to Facebook.{" "}
          <a href="#" className="text-blue-600">Learn more</a>.<br /> <br />
          By clicking Sign Up, you agree to our{" "}
          <a href="#" className="text-blue-600">Terms</a>,{" "}
          <a href="#" className="text-blue-600">Privacy Policy</a>, and{" "}
          <a href="#" className="text-blue-600">Cookies Policy</a>. You may receive SMS notifications from us and can opt out at any time.
        </p>

        <button
          type="submit"
          disabled={registerLoading}
          className="w-full py-3 bg-lime-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        {registerError && (
          <p className="mt-4 text-red-500 text-center">
            {registerError.message}
          </p>
        )}
        {registerData && !registerData.register.status && (
          <p className="mt-4 text-red-500 text-center">
            {registerData.register.message}
          </p>
        )}
      </form>
    )}

    {/* Toggle between login and signup */}
    <div className="mt-6 text-center">
      {isLogin ? (
        <p>
          Don't have an account?{" "}
          <a
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsLogin(false)}
          >
            Create new account
          </a>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <a
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsLogin(true)}
          >
            Log in
          </a>
        </p>
      )}
    </div>
  </div>
</div>

    </div>
  );
};

export default AuthPage;
