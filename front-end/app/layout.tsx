// app/layout.tsx
"use client";
import './globals.css';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { UserProvider } from './context/UserContext';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux'; // Import Redux Provider
import { store } from './store'; // Import the Redux store
import { Toaster, toast } from 'sonner'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNavbar = !['/pages/login', '/pages/signup'].includes(pathname);

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ApolloProvider client={client}>
        <Toaster />
          <UserProvider>
            <Provider store={store}> {/* Wrap in Redux Provider */}
              {showNavbar && <Navbar />} {/* Conditional Navbar */}
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </Provider>
          </UserProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
