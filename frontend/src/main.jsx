import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/alfa-slab-one';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import './i18n.js'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.log('Service Worker registration failed:', err);
    });
}

createRoot(document.getElementById('root')).render(
  <App />
)
