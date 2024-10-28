import { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  avatar_path: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  userProfile?: UserProfile; // Include userProfile
}

interface UserContextType {
  user: User | null;
  login: (userInfo: User) => void;
  logout: () => void;
  theme: string; // light or dark
  toggleTheme: () => void; // function to toggle theme
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<string>('light'); // Default to light theme

  // Load user and theme from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}'); // Retrieve full user info

    setTheme(savedTheme);

    if (token && userInfo.id) {
      // Ensure you retrieve the full user info with userProfile
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      // Check if userInfo contains userProfile before setting it
      if (userInfo && userInfo.userProfile) {
        setUser(userInfo);
      } else {
        console.warn("User info or user profile is missing.");
      }
    }
  }, []);

  const login = (userInfo: User) => {
    // Ensure userInfo contains userProfile
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo)); // Store user info with userProfile
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('likedPosts')
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save theme preference to localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout, theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
