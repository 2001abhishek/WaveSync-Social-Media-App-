import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Social Connect</h1>
        <p className="text-xl text-gray-600">A place to share your thoughts, ideas, and moments!</p>
      </header>

      <div className="flex space-x-4">
        <Link href="/pages/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Login
        </Link>
        <Link href="/pages/signup" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Sign Up
        </Link>
      </div>

      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; 2024 Social Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
