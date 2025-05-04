import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // Optional: Add custom middleware later
});

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;

export default store; 