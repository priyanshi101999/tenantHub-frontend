import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import PlanBadge from "../components/PlanBadge"
import { useAuth } from "../context/AuthContext"
import { getTaskAnalytics } from "../api/tasks"
import { getUsers } from "../api/workspace"

// Shows workspace overview and task stats.
function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total_tasks: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 })
  const [userCount, setUserCount] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const analytics = await getTaskAnalytics()
      setStats(analytics.data || stats)
    } catch (err) {
      setError(err.message || "Could not load task stats")
    }

    try {
      const users = await getUsers(1, 10)
      setUserCount(users.data?.pagination?.total_items || 0)
    } catch {
      setUserCount(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="truncate text-gray-600">{user?.workspace?.name || "Your workspace"}</p>
          </div>
          <PlanBadge plan={user?.plan || "Free"} />
        </div>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="mb-4 rounded border bg-white p-4 text-sm text-gray-600">Loading dashboard...</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Total" value={stats.total_tasks} />
          <Stat label="Todo" value={stats.todo} />
          <Stat label="In progress" value={stats.in_progress} />
          <Stat label="Done" value={stats.done} />
          <Stat label="Overdue" value={stats.overdue} />
        </div>

        <div className="mt-6 rounded border bg-white p-4 shadow-sm">
          <p className="font-semibold">Users</p>
          <p className="text-sm text-gray-600">{userCount} users loaded from this workspace.</p>
        </div>

        {user?.role === "ADMIN" && (
          <Link to="/billing" className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white">
            Upgrade plan
          </Link>
        )}
      </main>
    </>
  )
}

// Shows one dashboard number.
function Stat({ label, value }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value || 0}</p>
    </div>
  )
}

export default Dashboard
