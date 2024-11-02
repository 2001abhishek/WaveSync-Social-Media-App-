"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import CreatePost from "../../components/CreatePost";
import PostCard from "../../components/PostCard";
import FriendRequests from "../../components/FriendRequests";
import FriendList from "../../components/FriendList";
import { Toaster } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
}

const UserFeed = () => {
  const router = useRouter();
  const { user, theme } = useUser();
  const [localUser, setLocalUser] = useState<User | null>(null);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/pages/login");
      } else {
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        setLocalUser(userInfo);
      }
    } else {
      setLocalUser(user);
    }
  }, [router, user]);

  // if (!localUser) {
  //   return <p>Loading...</p>;
  // }

  return (
    <div className={`${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"} min-h-screen relative custom-scrollbar`}>
      <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: FriendList */}
        <div className="fixed w-1/4 p-4 z-10 hidden lg:block">
          <FriendList />
        </div>

        {/* Main Content: CreatePost and PostCard */}
        <main className="flex-1 p-4 lg:mr-6 custom-scrollbar">
          <div className="fade-in-top">
            <CreatePost />
          </div>
          <PostCard />

        </main>

        {/* Right Side: FriendRequests */}
        <div className="fixed mt-4 right-4 z-10 hidden lg:block ">
          <FriendRequests />
        </div>
      </div>
    </div>
  );
};

export default UserFeed;
