import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dbLocal } from "@/lib/indexedDB";
import { listsRef, getListDoc } from "@/lib/firebase";
import { addDoc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";

const isOnline = () => typeof window !== "undefined" ? navigator.onLine : true;

export const fetchLists = createAsyncThunk("lists/fetch", async (userId) => {
  if (!isOnline()) {
    return await dbLocal.lists.toArray();
  }

  try {
    const q = query(listsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    await dbLocal.lists.clear();
    await dbLocal.lists.bulkPut(lists);

    return lists;
  } catch {
    return await dbLocal.lists.toArray();
  }
});

export const createList = createAsyncThunk("lists/create", async ({ name, userId }) => {
  const list = {
    name,
    userId,
    createdAt: new Date().toISOString(),
    isOffline: !isOnline(),
  };

  const id = `offline_${Date.now()}`;
  const localList = { id, ...list };

  await dbLocal.lists.put(localList);

  if (!isOnline()) {
    return localList;
  }

  try {
    const docRef = await addDoc(listsRef, list);
    const syncedList = { ...list, id: docRef.id, isOffline: false };

    await dbLocal.lists.delete(id); // remove temp
    await dbLocal.lists.put(syncedList);

    return syncedList;
  } catch {
    return localList;
  }
});

export const renameList = createAsyncThunk("lists/rename", async ({ id, name }) => {
  const updated = { name, lastUpdated: new Date().toISOString() };

  const original = await dbLocal.lists.get(id);
  const newList = { ...original, ...updated };

  await dbLocal.lists.put(newList);

  if (!isOnline()) return newList;

  try {
    const docRef = getListDoc(id);
    await updateDoc(docRef, updated);
    return { ...newList, isOffline: false };
  } catch {
    return newList;
  }
});

export const removeList = createAsyncThunk("lists/delete", async (id) => {
  await dbLocal.lists.delete(id);

  if (!isOnline()) return id;

  try {
    const docRef = getListDoc(id);
    await deleteDoc(docRef);
  } catch {  }

  return id;
});

const listsSlice = createSlice({
  name: "lists",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(createList.fulfilled, (state, action) => {
        const exists = state.items.find(list => list.id === action.payload.id);
        if (!exists) state.items.push(action.payload);
      })
      .addCase(renameList.fulfilled, (state, action) => {
        const idx = state.items.findIndex(l => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeList.fulfilled, (state, action) => {
        state.items = state.items.filter(list => list.id !== action.payload);
      });
  },
});

export const selectAllLists = (state) => state.lists.items;
export default listsSlice.reducer;
