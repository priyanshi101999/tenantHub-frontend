import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { setInvitePassword } from "../api/auth"
import PasswordInput from "../components/PasswordInput"
import { useAuth } from "../context/AuthContext"

function InviteSetPassword() {
  const { secretToken } = useParams()
  const navigate = useNavigate()
  const { saveSession } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!secretToken) {
      setError("Invite link is missing a token.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const response = await setInvitePassword({
        password,
        secret_token: secretToken
      })
      const data = response.data || {}

      if (data.access_token) {
        saveSession(data)
        navigate("/dashboard")
      } else {
        navigate("/login")
      }
    } catch (err) {
      setError(err.message || "Could not set password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">Accept invite</h1>
        <p className="mb-6 text-sm text-gray-600">Set your password to join the workspace.</p>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
        <PasswordInput
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          required
        />

        <button className="w-full rounded bg-blue-600 p-2 text-white disabled:bg-blue-300" disabled={loading}>
          {loading ? "Setting password..." : "Set password"}
        </button>

        <p className="mt-4 text-sm text-gray-600">
          Already joined? <Link to="/login" className="text-blue-700">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default InviteSetPassword
