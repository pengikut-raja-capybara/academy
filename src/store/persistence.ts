import localforage from "localforage";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { RootState } from "./index";

// Configure localforage
localforage.config({
  name: "PRC_Academy",
  storeName: "learning_state",
});

export const PERSISTENCE_KEY = "capybara_academy_state";

export const persistenceMiddleware = createListenerMiddleware();

// Watch for any changes in the learning slice
persistenceMiddleware.startListening({
  predicate: (action) => {
    // We listen to any action that starts with 'learning/'
    return typeof action.type === "string" && action.type.startsWith("learning/");
  },
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const learningState = state.learning;
    
    // Save to localforage
    try {
      // Use current() if we are inside a context that might have proxies, 
      // but here we are getting it from the store, so it should be a plain object.
      // However, for consistency with our previous logic, we ensure it's clean.
      await localforage.setItem(PERSISTENCE_KEY, learningState);
    } catch (err) {
      console.error("Failed to persist state to localforage:", err);
    }
  },
});
