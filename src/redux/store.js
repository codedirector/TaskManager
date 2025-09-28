import { configureStore } from "@reduxjs/toolkit";
import listsReducer from "./listsSlice";
import tasksReducer from "./tasksSlice";

export const store = configureStore({
  reducer: {
    lists: listsReducer,
    tasks: tasksReducer,
  },
});
