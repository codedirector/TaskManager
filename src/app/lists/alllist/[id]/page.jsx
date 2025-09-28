'use client' 
import TasksUI from "@/Components/TasksUI"; 
import { useParams } from "next/navigation"; 
export default async function task(){ 
  const {id}=useParams(); 
  // console.log(id) 
  return <> <TasksUI listId={id}/>  </>
 }