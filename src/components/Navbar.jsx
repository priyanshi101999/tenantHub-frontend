import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Shows the main navigation after login.
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-xl font-bold text-blue-700">TenantHub</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-700">Dashboard</Link>
          <Link to="/tasks" className="text-gray-700 hover:text-blue-700">Tasks</Link>
          <Link to="/users" className="text-gray-700 hover:text-blue-700">Users</Link>
          {user?.role === "ADMIN" && <Link to="/billing" className="text-gray-700 hover:text-blue-700">Billing</Link>}
          <Link to="/profile" className="text-gray-700 hover:text-blue-700">Profile</Link>
          <span className="hidden text-gray-500 sm:inline">{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="rounded bg-gray-900 px-3 py-2 text-white">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
