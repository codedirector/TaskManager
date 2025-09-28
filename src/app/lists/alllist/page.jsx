'use client'
// import TasksUI from "@/Components/TasksUI";
// import ListsUI from "@/Components/ListsUI";
// export default async function Lists(){
   

//    return <>
// {/* <TasksUI/> */}
//    <ListsUI/>
//    {/* <h1>Lists</h1> */}
//    </>
// // }
// import { useDispatch, useSelector } from "react-redux";
// import { fetchLists, createList, renameList, removeList } from "@/redux/listsSlice";
// import {  useEffect, useState } from "react";
// import {useRouter} from "next/navigation";
// export default function ListsUI() {
//   const dispatch = useDispatch();
//   const router =useRouter();
//   const { items, status, error } = useSelector((s) => s.lists);
//   const [renamingId, setRenamingId] = useState(null);
//   const [newName, setNewName] = useState("");

//   useEffect(() => {
//     dispatch(fetchLists());
//   }, [dispatch]);

//   const startRename = (list) => {
//       console.log(list.id)
//     setRenamingId(list.id);
//     setNewName(list.name);
//   };

//   const submitRename = () => {
//     if (newName.trim()) {
//       dispatch(renameList({ id: renamingId, name: newName.trim() }));
//     }
//     setRenamingId(null);
//     setNewName("");
//   };

//   return (
//     <div className="p-4 border rounded max-w-md mx-auto">
//       <h2 className="text-lg font-bold mb-4">Lists</h2>
//       <button
//         onClick={() => dispatch(createList(`List ${items.length + 1}`))}
//         className="bg-green-600 text-white px-3 py-1 rounded mb-4"
//       >
//         Add List
//       </button>

//       {status === "loading" && <p>Loading...</p>}
//       {status === "failed" && <p className="text-red-600">Error: {error}</p>}

//       <ul>
//         {items.map((list) => (
//           <li key={list.id} className="flex justify-between items-center mb-2">
//             {renamingId === list.id ? (
//               <>
//                 <input
//                   type="text"
//                   value={newName}
//                   onChange={(e) => setNewName(e.target.value)}
//                   className="border px-2 py-1 mr-2 flex-grow"
//                 />
//                 <button onClick={submitRename} className="bg-blue-600 text-white px-2 rounded mr-1">
//                   Save
//                 </button>
//                 <button onClick={() => setRenamingId(null)} className="bg-gray-400 px-2 rounded">
//                   Cancel
//                 </button>
//               </>
//             ) : (
//               <>
//                 <span>{list.name}</span>
//                 <div>
//                   <button
//                     onClick={() => startRename(list)}
//                     className="bg-yellow-500 text-white px-2 rounded mr-1"
//                   >
//                     Rename
//                   </button>
//                   <button
//                     onClick={() => dispatch(removeList(list.id))}
//                     className="bg-red-600 text-white px-2 rounded"
//                   >
//                     Delete
//                   </button>
                  
//                   <button onClick={()=>router.push(`./alllist/${list.id}`)}>add task</button>
//                 </div>
//               </>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// import { useDispatch, useSelector } from "react-redux";
// import { fetchLists, createList, renameList, removeList } from "@/redux/listsSlice";
// import {  useEffect, useState } from "react";
// import {useRouter} from "next/navigation";
// import { auth } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// export default function ListsUI() {
 
// const userId = auth.currentUser?.uid;
// // console.log("hjhghj",userId)
//   const dispatch = useDispatch();
//   const router =useRouter();
//   const { items, status, error } = useSelector((s) => s.lists);
//   const [renamingId, setRenamingId] = useState(null);
//   const [newName, setNewName] = useState("");

//   // useEffect(() => {
//   //   dispatch(fetchLists(userId));
//   // }, [dispatch]);
// useEffect(() => {
  
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (user) {
//       dispatch(fetchLists(user.uid));
//     }
//   });

//   return () => unsubscribe();
// }, [dispatch]);
//   const startRename = (list) => {
//     setRenamingId(list.id);
//     setNewName(list.name);
//   };

//   const submitRename = () => {
//     if (newName.trim()) {
//       dispatch(renameList({ id: renamingId, name: newName.trim() }));
//     }
//     setRenamingId(null);
//     setNewName("");
//   };

//   return (
//     <div className="p-4 border rounded max-w-md mx-auto">
//       <h2 className="text-lg font-bold mb-4">Lists</h2>
//       <button
//         onClick={() =>dispatch(createList({ name: "New List", userId }))}
//         className="bg-green-600 text-white px-3 py-1 rounded mb-4"
//       >
//         Add List
//       </button>

//       {status === "loading" && <p>Loading...</p>}
//       {status === "failed" && <p className="text-red-600">Error: {error}</p>}

//       <ul>
//         {items.map((list) => (
//           <li key={list.id} className="flex justify-between items-center mb-2">
//             {renamingId === list.id ? (
//               <>
//                 <input
//                   type="text"
//                   value={newName}
//                   onChange={(e) => setNewName(e.target.value)}
//                   className="border px-2 py-1 mr-2 flex-grow"
//                 />
//                 <button onClick={submitRename} className="bg-blue-600 text-white px-2 rounded mr-1">
//                   Save
//                 </button>
//                 <button onClick={() => setRenamingId(null)} className="bg-gray-400 px-2 rounded">
//                   Cancel
//                 </button>
//               </>
//             ) : (
//               <>
//                 <span>{list.name}</span>
//                 <div>
//                   <button
//                     onClick={() => startRename(list)}
//                     className="bg-yellow-500 text-white px-2 rounded mr-1"
//                   >
//                     Rename
//                   </button>
//                   <button
//                     onClick={() => dispatch(removeList(list.id))}
//                     className="bg-red-600 text-white px-2 rounded"
//                   >
//                     Delete
//                   </button>
//                   <button onClick={()=>router.push(`./alllist/${list.id}`)}>add task</button>
//                 </div>
//               </>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

import { useDispatch, useSelector } from "react-redux";
import { fetchLists, createList, renameList, removeList } from "@/redux/listsSlice";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// This is my main component
export default function ListsUI() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items, status, error } = useSelector((state) => state.lists); // Getting lists from redux

  const [renamingListId, setRenamingListId] = useState(null);
  const [newListName, setNewListName] = useState("");
    const [setName, setNewName] = useState("");

  const handleAddList = () => {
    if (setName.trim() === "") return; // prevent empty lists
    dispatch(createList({ name: setName, userId }));
    setNewName(""); // clear input after adding
  };
  
  // I get the user id from firebase
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  // Fetch lists when user logs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in", user.uid); // just checking
        dispatch(fetchLists(user.uid));
      } else {
        console.log("No user");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // Start renaming list
  const startRename = (list) => {
    setRenamingListId(list.id);
    setNewListName(list.name);
  };

  // Submit new name to redux
  const submitRename = () => {
    if (newListName.trim() !== "") {
      dispatch(renameList({ id: renamingListId, name: newListName.trim() }));
    }
    setRenamingListId(null);
    setNewListName("");
  };

  // Add new list
  // const addNewList = () => {
  //   if (userId) {
  //     dispatch(createList({ name: "New List", userId: userId }));
  //   } else {
  //     console.log("No user ID");
  //   }
  // };

  // Delete a list
  const deleteList = (id) => {
    dispatch(removeList(id));
  };

  // Go to list page
  const goToList = (id) => {
    router.push(`./alllist/${id}`);
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">Lists</h2>
 <input
        type="text"
        value={setName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Enter list name"
        className="border rounded px-3 py-1 mb-2 w-full"
      />

      <button
        onClick={handleAddList}
        className="bg-green-600 text-white px-3 py-1 rounded mb-4"
      >
        Add List
      </button>

      {/* status messages */}
      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p className="text-red-600">Error: {error}</p>}

      <ul>
        {items.map((list) => {
          return (
            <li key={list.id} className="flex justify-between items-center mb-2">
              {renamingListId === list.id ? (
                <div className="flex flex-grow items-center">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="border px-2 py-1 mr-2 flex-grow"
                  />
                  <button onClick={submitRename} className="bg-blue-600 text-white px-2 rounded mr-1">
                    Save
                  </button>
                  <button onClick={() => setRenamingListId(null)} className="bg-gray-400 px-2 rounded">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between w-full items-center">
                  <span>{list.name}</span>
                  <div>
                    <button
                      onClick={() => startRename(list)}
                      className="bg-yellow-500 text-white px-2 rounded mr-1"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="bg-red-600 text-white px-2 rounded mr-1"
                    >
                      Delete
                    </button>
                    <button onClick={() => goToList(list.id)} className="bg-gray-600 text-white px-2 rounded">
                      Add Task
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
