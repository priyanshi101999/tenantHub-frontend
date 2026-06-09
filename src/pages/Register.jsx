import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser, sendEmailOtp } from "../api/auth"
import PasswordInput from "../components/PasswordInput"

// Shows the registration page for a workspace admin.
function Register() {
  const [workspaceName, setWorkspaceName] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRegister(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await registerUser({ workspaceName, name, email, phone, password, role: "ADMIN" })
      await sendEmailOtp(email)
      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleRegister} className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">TenantHub</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-500">Set up your TenantHub admin account and verify your email.</p>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="workspaceName">Workspace name</label>
            <input id="workspaceName" required className="w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Acme Rentals" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">Admin name</label>
            <input id="name" required autoComplete="name" className="w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="phone">Phone</label>
            <input id="phone" required autoComplete="tel" className="w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="+1 555 0100" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Admin email</label>
            <input id="email" required type="email" autoComplete="email" className="w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <PasswordInput id="password" autoComplete="new-password" className="rounded-md border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>
        <button className="mt-2 w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
