import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { loginUser, saveFcmToken } from "../api/auth"
import { getDeviceId, getFcmToken } from "../services/pushNotifications"

const AuthContext = createContext(null)

// Provides auth state and login/logout helpers to the app.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"))

  function saveSession(data) {
    localStorage.setItem("token", data.access_token)
    localStorage.setItem("refreshToken", data.refresh_token || "")
    localStorage.setItem("user", JSON.stringify(data.user || {}))
    setToken(data.access_token)
    setUser(data.user || {})
  }

  async function login(email, password) {
    const response = await loginUser({ email, password })
    const data = response.data || {}
    saveSession(data)
    return data
  }

  const registerPushDevice = useCallback(async () => {
    if (!localStorage.getItem("token")) return false

    try {
      const deviceId = getDeviceId()
      const fcmToken = await getFcmToken()
      if (!fcmToken) return false

      await saveFcmToken({
        fcm_token: fcmToken,
        device_id: deviceId
      })

      return true
    } catch (err) {
      console.warn("Could not register push notifications", err)
      return false
    }
  }, [])

  useEffect(() => {
    if (token) registerPushDevice()
  }, [token, registerPushDevice])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setToken("")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, saveSession, login, logout, registerPushDevice }}>
      {children}
    </AuthContext.Provider>
  )
}

// Returns the auth context.
export function useAuth() {
  return useContext(AuthContext)
}
