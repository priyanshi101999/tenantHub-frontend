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
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link to="/dashboard" className="truncate text-xl font-bold text-blue-700">TenantHub</Link>
          <span className="min-w-0 truncate text-xs text-gray-500 sm:hidden">{user?.name || user?.email}</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm sm:justify-end">
          <Link to="/dashboard" className="rounded px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700">Dashboard</Link>
          <Link to="/tasks" className="rounded px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700">Tasks</Link>
          <Link to="/users" className="rounded px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700">Users</Link>
          {user?.role === "ADMIN" && <Link to="/billing" className="rounded px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700">Billing</Link>}
          <Link to="/profile" className="rounded px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700">Profile</Link>
          <span className="hidden max-w-40 truncate text-gray-500 lg:inline">{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="rounded bg-gray-900 px-3 py-2 text-white">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
