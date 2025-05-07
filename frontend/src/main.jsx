import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GlobalStateProvider } from './context/GlobalStateContext'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalStateProvider>
      <App />
      <Toaster position="top-right" />
    </GlobalStateProvider>
  </React.StrictMode>,
)