import { combineReducers } from '@reduxjs/toolkit';

// Import slice reducers here when they are created
// Example: import exampleReducer from './slices/exampleSlice';

const rootReducer = combineReducers({
  // Add slice reducers here
  // example: exampleReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
