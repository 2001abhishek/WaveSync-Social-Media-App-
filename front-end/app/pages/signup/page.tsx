"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner"; // Import Sonner

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

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [register, { data, loading, error }] = useMutation(REGISTER_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password } = formData;
    try {
      const response = await register({
        variables: { name, email, password },
      });

      if (response.data.register.status) {
        localStorage.setItem("token", response.data.register.token);
        toast.success("Signup successful!"); // Success toast
        router.push("/pages/feed"); // Redirect to feed after successful signup
      } else {
        toast.error(response.data.register.message); // Error toast
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again."); // Error toast
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster /> {/* Place Toaster to display notifications */}
      
      {/* Facebook Logo */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-600">My Social</h1>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {/* Main Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Create a new account</h1>
        <p className="text-center text-gray-600 mb-6">It's quick and easy.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Informational Text Above Sign Up Button */}
          <p className="text-xs text-gray-500 mb-4 text-left">
            People who use our service may have uploaded your contact information to Facebook.{" "}
            <a href="#" className="text-blue-600">Learn more</a>.<br /> <br />
            By clicking Sign Up, you agree to our{" "}
            <a href="#" className="text-blue-600">Terms</a>,{" "}
            <a href="#" className="text-blue-600">Privacy Policy</a>, and{" "}
            <a href="#" className="text-blue-600">Cookies Policy</a>. You may receive SMS notifications from us and can opt out at any time.
          </p>

          <button
  type="submit"
  disabled={loading}
  className="w-full md:w-1/2 py-3 bg-lime-600 text-white rounded-lg hover:bg-green-700 transition mx-auto block"
>
  Sign Up
</button>


          {error && <p className="mt-4 text-red-500 text-center">{error.message}</p>}
          {data && !data.register.status && <p className="mt-4 text-red-500 text-center">{data.register.message}</p>}
        </form>

        {/* Already have an account? */}
        <div className="text-center mt-6">
          <a className="text-blue-600 cursor-pointer" onClick={() => router.push("/pages/login")}>
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
