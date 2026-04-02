// ─────────────────────────────────────────────────────────
// FILE: frontend/src/main.jsx
// ─────────────────────────────────────────────────────────

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { loadConfig } from './config'

loadConfig()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((err) => {
    console.error('Failed to load app config:', err)
    document.getElementById('root').innerHTML =
      '<div style="color:white;padding:2rem;font-family:sans-serif;">' +
      '<h1>Configuration Error</h1>' +
      '<p>Could not load application config. Please try refreshing.</p>' +
      '</div>'
  })