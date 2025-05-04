import React from 'react';
import ReactDOM from 'react-dom';
import VoiceDemo from './VoiceDemo';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);

  ReactDOM.render(
    <React.StrictMode>
      <VoiceDemo />
    </React.StrictMode>,
    rootElement
  );
});
