// 'use client'
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Lists(){
   
   const user=await verifySession();
   if(!user)
      redirect('./login');
  
   
   redirect('/')
   {/* <ListsUI/> */}
  

}