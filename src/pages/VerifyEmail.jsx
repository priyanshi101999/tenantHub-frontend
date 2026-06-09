import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { sendEmailOtp, verifyEmailOtp } from "../api/auth"

// Shows the email OTP verification page.
function VerifyEmail() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get("email") || "")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSendOtp() {
    setError("")
    setLoading(true)
    try {
      const response = await sendEmailOtp(email)
      setMessage(response.message || "OTP sent")
    } catch (err) {
      setError(err.message || "Could not send OTP")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await verifyEmailOtp({ email, code })
      navigate("/login")
    } catch (err) {
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleVerify} className="w-full max-w-md rounded bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold">Verify email</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <input required type="email" className="mb-4 w-full rounded border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input required className="mb-4 w-full rounded border p-2" placeholder="OTP code" value={code} onChange={e => setCode(e.target.value)} />
        <button className="w-full rounded bg-blue-600 p-2 text-white disabled:bg-blue-300" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        <button type="button" onClick={handleSendOtp} className="mt-3 w-full rounded border p-2" disabled={loading}>
          Send OTP again
        </button>
        <Link to="/login" className="mt-4 block text-sm text-blue-700">Back to login</Link>
      </form>
    </div>
  )
}

export default VerifyEmail
