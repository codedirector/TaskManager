
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // your firebase config
import { onAuthStateChanged } from 'firebase/auth';
export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
        setIsLoggedIn(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white">
      <div
        className="font-bold text-xl cursor-pointer"
        onClick={() => router.push('/')}
      >
        Task Manager
      </div>

      <ul className="flex space-x-6 list-none">
        {isLoggedIn ? (
          <li
            onClick={handleLogout}
            className="cursor-pointer text-red-600 hover:underline"
          >
            Logout
          </li>
        ) : (
          <>
            <li
              onClick={() => router.push('/signup')}
              className="cursor-pointer hover:underline"
            >
              Sign Up
            </li>
            <li
              onClick={() => router.push('/login')}
              className="cursor-pointer hover:underline"
            >
              Login
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
