import { cookies } from "next/headers";

export const POST = async()=>{
     cookies().delete('session');

    return new Response(JSON.stringify({success:true}),{status:200})
}