
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as d3 from 'd3';

// Expose D3 to the window for easier debugging if needed
(window as any).d3 = d3;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
