'use client'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function Login() {
    const router =useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful");
      const token = await userCredential.user.getIdToken();
      await fetch("/api/setcookie", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ token }),
});
    router.push('/')
      // console.log("JWT token:", token);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className=" h-screen flex flex-col justify-center items-center text-white bg-black"
    >
      <div className="flex items-center justify-center underline text-4xl font-mono mb-10">
        Login
      </div>

      <div className="bg-white/10 border-2 border-white p-8 rounded max-w-md mx-auto text-white w-full">
        <div className="flex flex-col gap-6">
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
              className="bg-black p-2 rounded text-white placeholder-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-white"
              name="email"
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
              placeholder="Enter password"
              className="bg-black p-2 rounded text-white placeholder-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-white"
              name="password"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleLogin}
        className="text-2xl mt-5 px-5 py-1 cursor-pointer border border-white rounded hover:bg-white hover:text-black transition"
      >
        Submit
      </button>
    </div>
  );
}
