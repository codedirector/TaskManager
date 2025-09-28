// lib/indexedDB.js
import Dexie from 'dexie';

export class TaskDB extends Dexie {
  constructor() {
    super('TaskDatabase');
    this.version(1).stores({
      lists: 'id, name, createdAt, isOffline, syncFailed, markedForDeletion',
      tasks: 'id, listId, status, priority, createdAt, dueDate, tags'
    });
  }
}

export const dbLocal = new TaskDB();

export async function searchTasksInIndexedDB(keyword) {
  const lowerKeyword = keyword.toLowerCase();

  // Fetch all tasks, then filter locally (simple but could be inefficient for huge DB)
  const allTasks = await dbLocal.tasks.toArray();

  // Filter tasks where title or description contains the keyword (case-insensitive)
  const filteredTasks = allTasks.filter(task => {
    const title = task.title ? task.title.toLowerCase() : '';
    const description = task.description ? task.description.toLowerCase() : '';
    return title.includes(lowerKeyword) || description.includes(lowerKeyword);
  });

  return filteredTasks;
}

// Utility function to debug IndexedDB
export const debugIndexedDB = {
  // Get all tasks
  async getAllTasks() {
    try {
      const allTasks = await dbLocal.tasks.toArray();
      console.log('All tasks in IndexedDB:', allTasks);
      return allTasks;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      return [];
    }
  },

  // Get tasks by listId
  async getTasksByListId(listId) {
    try {
      const tasks = await dbLocal.tasks.where('listId').equals(listId).toArray();
      console.log(`Tasks for list ${listId}:`, tasks);
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by listId:', error);
      return [];
    }
  },

  // Get task by id
  async getTaskById(id) {
    try {
      const task = await dbLocal.tasks.get(id);
      console.log(`Task with id ${id}:`, task);
      return task;
    } catch (error) {
      console.error('Error getting task by id:', error);
      return null;
    }
  },

  // Count all tasks
  async getTaskCount() {
    try {
      const count = await dbLocal.tasks.count();
      console.log('Total tasks in IndexedDB:', count);
      return count;
    } catch (error) {
      console.error('Error counting tasks:', error);
      return 0;
    }
  },

  // Clear all tasks (use with caution)
  async clearAllTasks() {
    try {
      await dbLocal.tasks.clear();
      console.log('All tasks cleared from IndexedDB');
    } catch (error) {
      console.error('Error clearing tasks:', error);
    }
  }
};

// import Dexie from "dexie";

// export const dbLocal = new Dexie("TaskManagerDB");
// dbLocal.version(1).stores({
//   lists: "id,name",   // primary key is `id`
//   tasks: "id,listId,name,status",
// });
