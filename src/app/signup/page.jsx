'use client'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {auth} from '@/lib/firebase';
import {toast} from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup(){
  const router=useRouter();
     const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [name, setname] = useState("");

  const handleClick = async () => {
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    if(password.length<6)
    {
       toast.error("Password should be of 6 chars");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      const token = await userCredential.user.getIdToken();

await fetch("/api/setcookie", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ token }),
});
router.push('./lists')
      toast.success("SignUp Successful");
      //   console.log("User created:", userCredential.user);
    } catch (error) {
      console.error("Signup error:", error.message);
      toast.error(error.message);
    }
  };
  return (
     <div className="h-screen flex flex-col justify-center items-center text-white bg-black px-4">
      <div className="flex items-center justify-center underline text-4xl font-mono mb-10">
        SignUp
      </div>

      <div className="bg-white/10 border-2 border-white p-8 rounded max-w-md w-full text-white">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-semibold">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              name="name"
              className="bg-black p-2 rounded text-white placeholder-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-semibold">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              name="email"
              className="bg-black p-2 rounded text-white placeholder-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 font-semibold">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (6-10 chars)"
              name="password"
              className="bg-black p-2 rounded text-white placeholder-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="text-2xl mt-5 px-5 py-1 cursor-pointer border border-white rounded hover:bg-white hover:text-black transition"
      >
        Submit
      </button>
    </div>
  );
}

