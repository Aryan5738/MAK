import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
  <App />
  <Toaster 
   position="top-center" 
   richColors 
   theme="light"
   toastOptions={{
    style: {
     background: 'white',
     border: '1px solid #E2E8F0',
     borderRadius: '16px',
     fontFamily: 'Outfit',
     fontWeight: '600',
     fontSize: '13px',
    }
   }}
  />
 </React.StrictMode>,
)
