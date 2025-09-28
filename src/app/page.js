'use client';

import  { useState, useEffect } from 'react';
import { searchTasksInIndexedDB } from '@/lib/indexedDB'; 
import ListsUI from '@/Components/ListsUI';
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
export default function Home() {
  const router =useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = auth.currentUser;
  const [isLoggedin,setLoggedin]=useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log("User logged in", user.uid); // just checking
       setLoggedin(true);
      } else {
        router.push('/login');
        // console.log("No user");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    searchTasksInIndexedDB(searchQuery)
      .then(results => {
        setSearchResults(results);
        setLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to search tasks.');
        setLoading(false);
      });
  }, [searchQuery]);

  return (
    <div className="max-w-md mx-auto p-4">
    {isLoggedin ? (
  <>
    <h1 className="text-2xl font-bold mb-4">Search Tasks</h1>

    <input
      type="text"
      placeholder="Search tasks..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    />

    {loading && <p>Searching...</p>}
    {error && <p className="text-red-600">{error}</p>}

    {!loading && searchResults.length === 0 && searchQuery.trim() !== '' && (
      <p>No tasks found matching "{searchQuery}"</p>
    )}

    <ul>
      {searchResults.map(task => (
        <li key={task.id} className="border-b py-2">
          <strong>{task.title}</strong>
          <p className="text-sm text-gray-600">List: {task.listName}</p>
        </li>
      ))}
    </ul>


    <ListsUI />
  </>
):<></>}
    </div>
  );
}
