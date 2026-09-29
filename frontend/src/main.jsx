import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/index.css'

// 本機開發／Docker 用相對路徑（走 Vite proxy 或 nginx）；
// 部署到 Cloudflare Pages 時，用 VITE_API_URL 指向後端的完整網址。
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
