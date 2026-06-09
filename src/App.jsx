import { Navigate, Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import InviteSetPassword from "./pages/InviteSetPassword"
import VerifyEmail from "./pages/VerifyEmail"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import TaskEdit from "./pages/TaskEdit"
import Users from "./pages/Users"
import Billing from "./pages/Billing"
import Profile from "./pages/Profile"
import { listenForForegroundMessages } from "./services/pushNotifications"

// Defines all app routes.
function App() {
  useEffect(() => {
    let unsubscribe = () => {}
    let active = true

    listenForForegroundMessages(payload => {
      const notification = payload.notification || {}
      if (Notification.permission === "granted" && notification.title) {
        new Notification(notification.title, {
          body: notification.body || "",
          icon: "/vite.svg"
        })
      }
    }).then(nextUnsubscribe => {
      if (active) unsubscribe = nextUnsubscribe
      else nextUnsubscribe()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/invite/:secretToken" element={<InviteSetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskEdit /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><AdminRoute><Billing /></AdminRoute></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
