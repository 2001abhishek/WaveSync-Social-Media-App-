// store.ts
import { configureStore } from '@reduxjs/toolkit';
import postReducer from './features/postSlice'; // We will create this next

export const store = configureStore({
  reducer: {
    posts: postReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
