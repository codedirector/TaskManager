import { cookies } from "next/headers";

export async function POST(req) {
  const { token } = await req.json();

  if (!token) {
    return new Response(JSON.stringify({ error: "No token provided" }), { status: 400 });
  }

  await cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 , 
    sameSite: "strict",
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
