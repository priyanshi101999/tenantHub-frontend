import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import PasswordInput from "../components/PasswordInput"
import { changePassword } from "../api/auth"
import { useAuth } from "../context/AuthContext"

// Shows current user info and profile actions.
function Profile() {
  const { user, registerPushDevice } = useAuth()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openSection, setOpenSection] = useState("")

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setPushAlerts(true)
    }
  }, [])

  function ChevronIcon({ open }) {
    return (
      <svg aria-hidden="true" className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    )
  }

  function toggleSection(section) {
    setOpenSection(current => current === section ? "" : section)
  }

  async function handlePassword(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const response = await changePassword({ old_password: oldPassword, new_password: newPassword })
      setMessage(response.message || "Password changed")
      setOldPassword("")
      setNewPassword("")
    } catch (err) {
      setError(err.message || "Could not change password")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeviceToken() {
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const saved = await registerPushDevice()
      if (saved) {
        setPushAlerts(true)
        setMessage("Device token saved")
      }
      else setError("Could not get notification permission or FCM token")
    } catch (err) {
      setError(err.message || "Could not save token")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}

        <div className="mb-6 rounded border bg-white p-4 shadow-sm">
          <p className="truncate font-semibold">{user?.name || "Current user"}</p>
          <p className="truncate text-sm text-gray-600">{user?.email}</p>
        </div>

        <section className="mb-4 overflow-hidden rounded border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("password")}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50"
          >
            Change password
            <ChevronIcon open={openSection === "password"} />
          </button>
          {openSection === "password" && (
            <form onSubmit={handlePassword} className="border-t p-4">
              <PasswordInput wrapperClassName="mb-3" placeholder="Old password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              <PasswordInput wrapperClassName="mb-3" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button disabled={loading} className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300 sm:w-auto">
                {loading ? "Saving..." : "Change password"}
              </button>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("notifications")}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50"
          >
            Notifications
            <ChevronIcon open={openSection === "notifications"} />
          </button>
          {openSection === "notifications" && (
            <div className="border-t p-4">
              <label className="mb-3 flex items-center gap-2"><input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} /> Email</label>
              <label className="mb-3 flex items-center gap-2"><input type="checkbox" checked={pushAlerts} onChange={e => setPushAlerts(e.target.checked)} /> Push</label>
              <button onClick={handleDeviceToken} disabled={loading || !pushAlerts} className="w-full rounded bg-gray-900 px-4 py-2 text-white disabled:bg-gray-300 sm:w-auto">
                {loading ? "Saving..." : "Enable push notifications"}
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default Profile
