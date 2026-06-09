import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { forgotPassword, resetPassword } from "../api/auth"
import PasswordInput from "../components/PasswordInput"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState("request")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSendOtp(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const response = await forgotPassword(email)
      setMessage(response.message || "OTP sent successfully")
      setStep("reset")
    } catch (err) {
      setError(err.message || "Could not send reset OTP")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const response = await resetPassword({ email, code, new_password: newPassword })
      setMessage(response.message || "Password reset successfully")
      setTimeout(() => navigate("/login"), 800)
    } catch (err) {
      setError(err.message || "Could not reset password")
    } finally {
      setLoading(false)
    }
  }

  const isResetStep = step === "reset"

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={isResetStep ? handleResetPassword : handleSendOtp} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">TenantHub</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-500">
            {isResetStep ? "Enter the OTP from your email and choose a new password." : "Enter your email and we will send you a reset OTP."}
          </p>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>}

        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
        <input
          id="email"
          required
          type="email"
          autoComplete="email"
          className="mb-4 w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="you@example.com"
          value={email}
          onChange={event => setEmail(event.target.value)}
          disabled={isResetStep}
        />

        {isResetStep && (
          <>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="code">OTP code</label>
            <input
              id="code"
              className="mb-4 w-full rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter OTP"
              value={code}
              onChange={event => setCode(event.target.value)}
            />
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="newPassword">New password</label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              className="rounded-md border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="New password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
            />
          </>
        )}

        <button className="mt-2 w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300" disabled={loading}>
          {loading ? "Please wait..." : isResetStep ? "Reset password" : "Send OTP"}
        </button>

        {isResetStep && (
          <button type="button" onClick={handleSendOtp} className="mt-3 w-full rounded-md border border-slate-300 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={loading}>
            Send OTP again
          </button>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered it? <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">Back to login</Link>
        </p>
      </form>
    </div>
  )
}

export default ForgotPassword
