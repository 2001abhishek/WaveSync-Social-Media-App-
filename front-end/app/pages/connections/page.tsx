"use client";
import React, { useState } from 'react';
import FriendList from '@/app/components/FriendList';
import FriendRequests from '@/app/components/FriendRequests';
import FriendSuggestion from '@/app/components/FriendSuggestion';
import { useUser } from "../../context/UserContext";

function Page() {
  const [activeComponent, setActiveComponent] = useState('FriendList'); // State to control the active component on mobile view
  const { user, theme } = useUser();

  // Toggle active component on mobile
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'FriendList':
        return <FriendList />;
      case 'FriendRequests':
        return <FriendRequests />;
      case 'FriendSuggestion':
        return <FriendSuggestion />;
      default:
        return <FriendList />;
    }
  };

  return (
    <div className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen`}>
      {/* Toggle buttons for mobile view */}
      <div className="block md:hidden text-center mb-4">
        <button
          className={`px-4 py-2 mr-2 mb-2 rounded transition-all duration-300 ${activeComponent === 'FriendList' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} hover:bg-blue-400`}
          onClick={() => setActiveComponent('FriendList')}
        >
          Friend List
        </button>
        <button
          className={`px-4 py-2 mr-2 mb-2 rounded transition-all duration-300 ${activeComponent === 'FriendRequests' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} hover:bg-blue-400`}
          onClick={() => setActiveComponent('FriendRequests')}
        >
          Friend Requests
        </button>
        <button
          className={`px-4 py-2 mb-2 rounded transition-all duration-300 ${activeComponent === 'FriendSuggestion' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} hover:bg-blue-400`}
          onClick={() => setActiveComponent('FriendSuggestion')}
        >
          Friend Suggestions
        </button>
      </div>

      {/* Responsive layout for desktop and tablet */}
      <div className="hidden md:flex justify-between gap-4 p-4 h-screen">
        <div className="flex-1 p-0 fade-in-bottom">
          <FriendList />
        </div>
        <div className="flex-1 p-0 fade-in-top">
          <FriendRequests />
        </div>
        <div className="flex-1 p-0 fade-in-bottom">
          <FriendSuggestion />
        </div>
      </div>

      {/* Mobile view with toggle feature */}
      <div className="md:hidden p-0">
        {renderActiveComponent()}
      </div>
    </div>
  );
}

export default Page;
