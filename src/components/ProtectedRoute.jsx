import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Protects pages that need a logged-in user.
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
