
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { dbLocal } from "@/lib/indexedDB";
import { tasksRef, getTaskDoc} from "@/lib/firebase";
import { addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Task status constants
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  DONE: 'done'
};

// Task priority constants
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Utility function to check online status
const isOnline = () => navigator.onLine;

// Enhanced fetchTasks with proper offline support
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (listId) => {
  // console.log('Fetching tasks for listId:', listId);
  // console.log('Online status:', isOnline());
  
  // If offline, go directly to IndexedDB
  if (!isOnline()) {
    // console.log('Device offline, fetching from IndexedDB directly');
    try {
      const localTasks = await dbLocal.tasks.where('listId').equals(listId).toArray();
      // console.log('Offline tasks from IndexedDB:', localTasks);
      return localTasks;
    } catch (error) {
      console.error("Error fetching from IndexedDB:", error);
      return [];
    }
  }
  
  try {
    // Try Firebase first with timeout
    const firebasePromise = getDocs(tasksRef(listId));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase timeout')), 8000)
    );
    
    const snapshot = await Promise.race([firebasePromise, timeoutPromise]);
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // console.log('Tasks from Firebase:', tasks);
    
    // Store in IndexedDB for offline use
    if (tasks.length > 0) {
      try {
        await dbLocal.tasks.bulkPut(tasks);
        // console.log('Tasks saved to IndexedDB');
      } catch (dbError) {
        console.error('Error saving to IndexedDB:', dbError);
      }
    }
    
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks from Firebase:", error);
    
    // Check if it's a network error
    const isNetworkError = error.code === 'unavailable' || 
                          error.message?.includes('network') || 
                          error.message?.includes('failed') ||
                          error.message?.includes('timeout') ||
                          !isOnline();
    
    if (isNetworkError) {
      // console.log('Network error detected, falling back to IndexedDB');
      try {
        const localTasks = await dbLocal.tasks.where('listId').equals(listId).toArray();
        // console.log('Fallback tasks from IndexedDB:', localTasks);
        return localTasks;
      } catch (indexedDBError) {
        console.error("Error fetching tasks from IndexedDB:", indexedDBError);
        return [];
      }
    } else {
      // If it's not a network error, rethrow it
      throw error;
    }
  }
});

// Enhanced createTask with offline support
export const createTask = createAsyncThunk("tasks/createTask", async ({ listId, task }) => {
  const online = isOnline();
  // console.log('Creating task, online status:', online);
  
  const taskWithDefaults = {
    ...task,
    listId, // Ensure listId is included
    createdAt: new Date().toISOString(),
    tags: task.tags || [],
    priority: task.priority || TASK_PRIORITY.MEDIUM,
    status: task.status || TASK_STATUS.TODO,
    // Add offline metadata if created offline
    isOffline: !online,
    syncFailed: false
  };
  
  // Generate temporary ID for offline tasks
  const tempId = !online ? `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;
  
  if (!online) {
    // console.log('Device offline, creating task locally');
    const offlineTask = { ...taskWithDefaults, id: tempId };
    
    try {
      await dbLocal.tasks.put(offlineTask);
      // console.log('Offline task saved to IndexedDB:', offlineTask);
      return offlineTask;
    } catch (error) {
      console.error("Error saving offline task:", error);
      throw error;
    }
  }
  
  try {
    const newDoc = await addDoc(tasksRef(listId), taskWithDefaults);
    const newTask = { id: newDoc.id, ...taskWithDefaults };
    
    // Store in IndexedDB
    try {
      await dbLocal.tasks.put(newTask);
      // console.log('Task saved to IndexedDB:', newTask);
    } catch (dbError) {
      console.error('Error saving to IndexedDB:', dbError);
    }
    
    return newTask;
  } catch (error) {
    console.error("Error creating task online, saving offline:", error);
    
    // If online creation fails, save offline
    const offlineTask = { 
      ...taskWithDefaults, 
      id: tempId, 
      syncFailed: true,
      isOffline: true 
    };
    
    try {
      await dbLocal.tasks.put(offlineTask);
      // console.log('Fallback offline task saved:', offlineTask);
      return offlineTask;
    } catch (offlineError) {
      console.error("Error saving fallback offline task:", offlineError);
      throw offlineError;
    }
  }
});

// Enhanced updateTask with offline support
export const updateTaskThunk = createAsyncThunk("tasks/updateTask", async ({ listId, task }, { dispatch }) => {
  const online = isOnline();
  // console.log('Updating task, online status:', online);
  
  // Optimistic update
  dispatch(optimisticUpdateTask(task));
  
  if (!online) {
    // console.log('Device offline, updating task locally');
    // Mark for sync when online
    const offlineTask = { 
      ...task, 
      isOffline: true,
      syncFailed: true,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await dbLocal.tasks.put(offlineTask);
      // console.log('Offline update saved to IndexedDB');
      return offlineTask;
    } catch (error) {
      console.error("Error saving offline update:", error);
      // Revert by refetching
      dispatch(fetchTasks(listId));
      throw error;
    }
  }
  
  try {
    const ref = getTaskDoc(listId, task.id);
    await updateDoc(ref, task);
    
    // Update IndexedDB
    const updatedTask = { ...task, isOffline: false, syncFailed: false };
    await dbLocal.tasks.put(updatedTask);
    
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    
    // If update fails, mark for offline sync
    const offlineTask = { 
      ...task, 
      isOffline: true,
      syncFailed: true,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await dbLocal.tasks.put(offlineTask);
      // console.log('Update failed, saved as offline task');
      return offlineTask;
    } catch (offlineError) {
      console.error("Error saving failed update:", offlineError);
    }
    
    // Revert by refetching
    dispatch(fetchTasks(listId));
    throw error;
  }
});

// Enhanced deleteTask with offline support
export const deleteTaskThunk = createAsyncThunk("tasks/deleteTask", async ({ listId, id }, { dispatch }) => {
  const online = isOnline();
  // console.log('Deleting task, online status:', online);
  
  // Optimistic delete
  dispatch(optimisticDeleteTask(id));
  
  if (!online) {
    // console.log('Device offline, marking task for deletion');
    // Instead of deleting, mark for deletion when online
    try {
      const task = await dbLocal.tasks.get(id);
      if (task) {
        const markedTask = { 
          ...task, 
          markedForDeletion: true,
          markedAt: new Date().toISOString()
        };
        await dbLocal.tasks.put(markedTask);
        console.log('Task marked for deletion');
      }
      return id;
    } catch (error) {
      console.error("Error marking task for deletion:", error);
      dispatch(fetchTasks(listId));
      throw error;
    }
  }
  
  try {
    const ref = doc(tasksRef(listId), id);
    await deleteDoc(ref);
    await dbLocal.tasks.delete(id);
    return id;
  } catch (error) {
    console.error("Error deleting task:", error);
    
    // Mark for deletion instead
    try {
      const task = await dbLocal.tasks.get(id);
      if (task) {
        const markedTask = { 
          ...task, 
          markedForDeletion: true,
          markedAt: new Date().toISOString()
        };
        await dbLocal.tasks.put(markedTask);
        // console.log('Delete failed, task marked for deletion');
      }
      return id;
    } catch (markError) {
      console.error("Error marking task for deletion:", markError);
    }
    
    dispatch(fetchTasks(listId));
    throw error;
  }
});

// Sync offline tasks when coming back online
export const syncOfflineTasks = createAsyncThunk("tasks/syncOfflineTasks", async (_, { dispatch }) => {
  if (!isOnline()) {
    // console.log('Device still offline, skipping sync');
    return { synced: 0, failed: 0 };
  }
  
  // console.log('Starting offline tasks sync...');
  
  try {
    // Get all tasks that need syncing
    const offlineTasks = await dbLocal.tasks
      .filter(task => task.isOffline || task.syncFailed || task.markedForDeletion)
      .toArray();
    
    // console.log('Tasks to sync:', offlineTasks.length);
    
    let synced = 0;
    let failed = 0;
    
    for (const task of offlineTasks) {
      try {
        if (task.markedForDeletion) {
          // Delete from Firebase
          const ref = getTaskDoc(task.listId, task.id);
          await deleteDoc(ref);
          await dbLocal.tasks.delete(task.id);
          // console.log('Synced deletion for task:', task.id);
        } else if (task.isOffline && !task.id.startsWith('offline_')) {
          // Update existing task
          const { id, listId, isOffline, syncFailed, markedForDeletion, ...taskData } = task;
          const ref = doc(tasksRef(listId), id);
          await updateDoc(ref, taskData);
          
          // Update local record
          await dbLocal.tasks.put({ ...task, isOffline: false, syncFailed: false });
          // console.log('Synced update for task:', task.id);
        } else if (task.isOffline && task.id.startsWith('offline_')) {
          // Create new task (was created offline)
          const { id, isOffline, syncFailed, markedForDeletion, ...taskData } = task;
          const newDoc = await addDoc(tasksRef(task.listId), taskData);
          
          // Replace local record with real ID
          await dbLocal.tasks.delete(task.id);
          await dbLocal.tasks.put({ ...taskData, id: newDoc.id });
          // console.log('Synced creation for task, new ID:', newDoc.id);
        }
        
        synced++;
      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
        // Mark as sync failed for retry
        await dbLocal.tasks.put({ ...task, syncFailed: true });
        failed++;
      }
    }
    
    console.log(`Sync completed: ${synced} successful, ${failed} failed`);
    return { synced, failed };
  } catch (error) {
    console.error('Error during sync:', error);
    throw error;
  }
});

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // console.log('Device came online, triggering sync');
    // You can dispatch syncOfflineTasks here if you have access to store
  });
  
  window.addEventListener('offline', () => {
    // console.log('Device went offline');
  });
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    operationStatus: {
      updating: null,
      deleting: null,
      creating: false
    },
    online: typeof window !== 'undefined' ? navigator.onLine : true,
    lastSync: null
  },
  reducers: {
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    optimisticUpdateTask: (state, action) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    optimisticDeleteTask: (state, action) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    setOperationStatus: (state, action) => {
      state.operationStatus = { ...state.operationStatus, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setOnlineStatus: (state, action) => {
      state.online = action.payload;
    },
    setLastSync: (state, action) => {
      state.lastSync = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createTask.pending, (state) => {
        state.operationStatus.creating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.operationStatus.creating = false;
        state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.operationStatus.creating = false;
        state.error = action.error.message;
      })
      .addCase(updateTaskThunk.pending, (state, action) => {
        state.operationStatus.updating = action.meta.arg.task.id;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.operationStatus.updating = null;
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.operationStatus.updating = null;
        state.error = action.error.message;
      })
      .addCase(deleteTaskThunk.pending, (state, action) => {
        state.operationStatus.deleting = action.meta.arg.id;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.operationStatus.deleting = null;
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.operationStatus.deleting = null;
        state.error = action.error.message;
      })
      .addCase(syncOfflineTasks.fulfilled, (state, action) => {
        state.lastSync = new Date().toISOString();
        console.log('Sync completed:', action.payload);
      });
  },
});

// Enhanced selectors with filtering and sorting
export const selectTasksState = (state) => state.tasks;

export const selectTasksByListId = createSelector(
  [selectTasksState, (_, listId) => listId],
  (tasks, listId) => tasks.items.filter(task => task.listId === listId)
);

// Filter out tasks marked for deletion
export const selectActiveTasksByListId = createSelector(
  [selectTasksState, (_, listId) => listId],
  (tasks, listId) => tasks.items.filter(task => 
    task.listId === listId && !task.markedForDeletion
  )
);

// Selector for getting all  tags from tasks
export const selectAllTags = createSelector(
  [selectTasksState],
  (tasks) => {
    const allTags = new Set();
    tasks.items.forEach(task => {
      if (task.tags && !task.markedForDeletion) {
        task.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  }
);

// Selector for task statistics
export const selectTaskStats = createSelector(
  [selectTasksState, (_, listId) => listId],
  (tasks, listId) => {
    const listTasks = listId 
      ? tasks.items.filter(task => task.listId === listId && !task.markedForDeletion)
      : tasks.items.filter(task => !task.markedForDeletion);
    
    return {
      total: listTasks.length,
      todo: listTasks.filter(task => task.status === TASK_STATUS.TODO).length,
      inProgress: listTasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length,
      done: listTasks.filter(task => task.status === TASK_STATUS.DONE).length,
      offline: listTasks.filter(task => task.isOffline).length,
      needsSync: listTasks.filter(task => task.syncFailed).length
    };
  }
);

// Selector for online status
export const selectOnlineStatus = (state) => state.tasks.online;

// Selector for tasks that need syncing
export const selectTasksNeedingSync = createSelector(
  [selectTasksState],
  (tasks) => tasks.items.filter(task => task.isOffline || task.syncFailed || task.markedForDeletion)
);

export const selectFilteredTasks = createSelector(
  [selectTasksState, (_, filters) => filters],
  (tasks, filters) => {
    let filtered = tasks.items;
    
    // Filter by listId
    if (filters.listId) {
      filtered = filtered.filter(task => task.listId === filters.listId);
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    // Filter by tag
    if (filters.tag && filters.tag !== 'all') {
      filtered = filtered.filter(task => 
        task.tags && task.tags.includes(filters.tag)
      );
    }
    
    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];
        
        // Handle priority sorting (custom order)
        if (filters.sortBy === 'priority') {
          const priorityOrder = { [TASK_PRIORITY.HIGH]: 3, [TASK_PRIORITY.MEDIUM]: 2, [TASK_PRIORITY.LOW]: 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }
        
        // Handle date sorting
        if (filters.sortBy === 'dueDate' || filters.sortBy === 'createdAt') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }
);
export const { 
  addTask, 
  updateTask, 
  deleteTask, 
  optimisticUpdateTask, 
  optimisticDeleteTask,
  setOperationStatus,
  clearError,
  setOnlineStatus,
  setLastSync
} = tasksSlice.actions;

export default tasksSlice.reducer;