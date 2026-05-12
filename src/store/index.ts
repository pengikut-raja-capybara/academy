import { configureStore } from "@reduxjs/toolkit";
import learningReducer from "../features/learning/learningSlice";
import { persistenceMiddleware } from "./persistence";

export const store = configureStore({
  reducer: {
    learning: learningReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
