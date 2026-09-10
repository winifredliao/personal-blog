import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'auth_token'

function applyAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    applyAuthHeader(null)
    setToken(null)
  }, [])

  useEffect(() => {
    if (!token) {
      applyAuthHeader(null)
      setLoading(false)
      return
    }
    applyAuthHeader(token)
    axios.get('/api/auth/me')
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [token, logout])

  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout()
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(id)
  }, [logout])

  const login = async (password) => {
    const res = await axios.post('/api/auth/login', { password })
    localStorage.setItem(TOKEN_KEY, res.data.access_token)
    applyAuthHeader(res.data.access_token)
    setToken(res.data.access_token)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(token), loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
