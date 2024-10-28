"use client";

import Link from "next/link";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { HomeIcon,ChatBubbleLeftRightIcon,
  UserCircleIcon,
  NewspaperIcon,
  InformationCircleIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/solid';


import { Menu, Transition } from "@headlessui/react";
import { useState, Fragment, useEffect } from "react";
import { useMutation, gql } from '@apollo/client';

const LOGOUT_MUTATION = gql`
  mutation Logout($userId: ID!) {
    logout(userId: $userId) {
      status
      message
    }
  }
`;


const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu
  const { user, logout, theme, toggleTheme } = useUser();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  useEffect(() => {
    // Simulate loading state (you can replace this with actual data fetching logic)
    setTimeout(() => setIsLoading(false), 1000);
  }, []);


  const handleLogout = async () => {
    try {
      const { data } = await logoutMutation({ variables: { userId: user.id } });
      if (data.logout.status) {
        logout(); // Clear state and localStorage
        router.push("/pages/login"); // Redirect to login
      } else {
        console.error("Logout failed:", data.logout.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle hamburger menu
   // Function to handle scrolling
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const NavbarSkeleton = () => {
    return (
      <nav className="p-1 bg-gray-200 shadow-lg sticky top-0 z-50 fixed w-full">
        <div className="container mx-auto flex justify-between mt-[18px] items-center">
          {/* Skeleton for Logo and Search Input */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-24 bg-gray-300 rounded animate-pulse"></div>
            <div className="hidden sm:block h-8 w-48 sm:w-64 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
  
          {/* Skeleton for Navbar links */}
          <div className="hidden sm:flex items-center justify-center space-x-8">
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
  
          {/* Skeleton for Profile Avatar */}
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </nav>
    );
  };
  
  if (isLoading) {
    return <NavbarSkeleton />; // Display skeleton loader if loading
  }
  
  return (
    <nav
      className={`p-1 transition-transform duration-300 ease-in-out ${
        theme === "dark" ? "bg-gray-900" : "bg-neutral-200	"
      } shadow-lg sticky top-0 z-50 fixed`} 
    >{/* ${isVisible ? "transform translate-y-0" : "transform -translate-y-full"} */}
      
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side: Logo */}
<div className="flex items-center">
  <div className="flex items-center">
    <img
      src={theme === "dark" ? "/assets/ScalerDarkMode.png" : "/assets/ScalerWhiteMode.png"}
      alt="Scaler Logo"
      className="h-12 w-auto" // Adjust height and width as necessary
    />
  </div>
  {/* Show search input only if the user is logged in */}
  {user && (
    <input
      type="text"
      placeholder="Search"
      className={`ml-1 rounded-full p-1 w-48 sm:w-64 mt-4 ${
        theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
      }`}
    />
  )}
</div>


        

        {/* Center: Navigation links (shown only if user is logged in) */}
{user && (
  <div className="hidden sm:flex items-center justify-center space-x-8">
    <Link
      href="/pages/feed"
      className={`flex items-center cursor-pointer ${
        theme === "dark" ? "text-blue-400" : "text-black"
      } group`}
    >
      <HomeIcon className="h-6 w-6 mr-1 transition-transform duration-200 group-hover:scale-110" />
      <span
        className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1"
      >
        My&nbsp;Feed
      </span>
    </Link>

    <Link
      href="/pages/connections"
      className={`flex items-center cursor-pointer ${
        theme === "dark" ? "text-blue-400" : "text-black"
      } group`}
    >
      <UsersIcon className="h-6 w-6 mr-1 transition-transform duration-200 group-hover:scale-110" />
      <span
        className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1"
      >
        Peoples
      </span>
    </Link>

    {/* <Link
      href="/pages/chat"
      className={`flex items-center cursor-pointer ${
        theme === "dark" ? "text-white" : "text-black"
      } group`}
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6 mr-1 transition-transform duration-200 group-hover:scale-110" />
      <span
        className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1"
      >
        Chat
      </span>
    </Link>

    <Link
      href="/pages/news"
      className={`flex items-center cursor-pointer ${
        theme === "dark" ? "text-white" : "text-black"
      } group`}
    >
      <NewspaperIcon className="h-6 w-6 mr-1 transition-transform duration-200 group-hover:scale-110" />
      <span
        className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-1"
      >
        News
      </span>
    </Link> */}
  </div>
)}


        {/* Right side: Profile dropdown or login links */}
{user ? (
  <div className="relative z-50">
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center p-0 bg-transparent">
        {/* User's Avatar */}
        <img
          src={
            user.userProfile?.avatar_path
              ? `https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/${user.userProfile.avatar_path}`
              : "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" // Fallback to default avatar if none exists
          }
          alt="User Avatar"
          className={`h-8 w-8 rounded-full object-cover ${
            theme === 'dark' ? 'border-white' : 'border-black'
          } border-2`} // Optional: add a border for visibility
        />
        {/* User's Name - hidden on small screens */}
        <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-black'} hidden sm:block font-bold	`}>
          {user.name}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {/* Conditional Background for Dropdown Items */}
        <Menu.Items
          className={`absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none dropdown-z-index ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="py-1">
            {/* Profile Link */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/pages/profile"
                  className={`block px-4 py-2 text-sm ${
                    active
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                >
                  My Profile
                </Link>
              )}
            </Menu.Item>
            
            {/* Logout Option (Using div) */}
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={handleLogout}
                  className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                    active
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                >
                  Logout
                </div>
              )}
            </Menu.Item>
            
            {/* Theme Toggle (Using div) */}
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={toggleTheme}
                  className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                    active
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                >
                  Theme: {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
) : (
  <div className="flex items-center space-x-4">
    <Link
      href="/pages/login"
      className={`flex items-center ${
        theme === "dark" ? "text-white" : "text-black"
      } hover:underline`}
    >
      <UserCircleIcon className="h-5 w-5 mr-1" />
      Login
    </Link>
    <Link
      href="/about"
      className={`flex items-center ${
        theme === "dark" ? "text-white" : "text-black"
      } hover:underline`}
    >
      <InformationCircleIcon className="h-5 w-5 mr-1" />
      About&nbsp;Us
    </Link>
  </div>
)}


        {/* Hamburger icon for mobile */}
        <div className="sm:hidden">
          <button onClick={toggleMenu}>
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-white" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Side navigation for mobile */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } sm:hidden bg-gray-800 bg-opacity-75`}
      >
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 p-5">
          <button onClick={toggleMenu} className="mb-8">
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
          <nav className="space-y-4">
            <Link
              href="/pages/feed"
              className="text-white flex items-center space-x-2 hover:underline"
            >
              <HomeIcon className="h-5 w-5" />
              <span>My Feed</span>
            </Link>
            <Link
              href="/pages/connections"
              className="text-white flex items-center space-x-2 hover:underline"
            >
              <UsersIcon className="h-5 w-5" />
              <span>Peoples</span>
            </Link>
            <Link
              href="/pages/chat"
              className="text-white flex items-center space-x-2 hover:underline"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Chat</span>
            </Link>
            <Link
              href="/pages/news"
              className="text-white flex items-center space-x-2 hover:underline"
            >
              <NewspaperIcon className="h-5 w-5" />
              <span>News</span>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
