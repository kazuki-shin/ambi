// Simple console log to test TS emission
// console.log('Hello from index.tsx!');

// Add dummy export to satisfy isolatedModules
// export {};

import React from 'react';
import { createRoot } from 'react-dom/client';
import VoiceDemo from './VoiceDemo'; // Restore this import

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <VoiceDemo /> // Render the original component
    </React.StrictMode>
  );
} else {
  console.error('Root container not found'); // Original error message
}
