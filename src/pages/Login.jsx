import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import PasswordInput from "../components/PasswordInput"

// Shows the login page and saves the JWT after login.
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await login(email, password)
      if (data.user?.is_temp_password) navigate("/reset-password")
      else navigate("/dashboard")
    } catch (err) {
      if (err.message === "Email not verified") {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">TenantHub</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your workspace, users, and tasks.</p>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
        <input id="email" required type="email" autoComplete="email" className="mb-4 w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
        <PasswordInput id="password" autoComplete="current-password" className="rounded-md border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-blue-700 hover:text-blue-800">Forgot password?</Link>
        </div>
        <button className="mt-2 w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          No account? <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
