import React from 'react';
import { createRoot } from 'react-dom/client';
import VoiceDemo from './VoiceDemo';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <VoiceDemo />
    </React.StrictMode>
  );
});
