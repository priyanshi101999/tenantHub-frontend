import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { createUser, deleteUser, getUsers, inviteUser } from "../api/workspace"
import { useAuth } from "../context/AuthContext"

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

// Shows admin user management.
function Users() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [users, setUsers] = useState([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("USER")
  const [workspaceId, setWorkspaceId] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [invitingUserId, setInvitingUserId] = useState(null)
  const [removingUserId, setRemovingUserId] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, size: 10, total_items: 0, total_pages: 1 })

  useEffect(() => {
    loadUsers(pagination.page, pagination.size)
  }, [pagination.page, pagination.size])

  useEffect(() => {
    if (!message && !error) return

    const timer = window.setTimeout(() => {
      setMessage("")
      setError("")
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [message, error])

  async function loadUsers(page = pagination.page, size = pagination.size) {
    setError("")
    setLoadingUsers(true)
    try {
      const response = await getUsers(page, size)
      setUsers(response.data?.users || [])
      setPagination(previousPagination => ({
        ...previousPagination,
        ...(response.data?.pagination || {}),
        page,
        size
      }))
      const firstWorkspaceId = response.data?.users?.[0]?.workspace_id
      if (firstWorkspaceId) setWorkspaceId(String(firstWorkspaceId))
    } catch (err) {
      setError(err.message || "Could not load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      await createUser({
        name,
        email,
        phone,
        role,
        workspace_id: Number(workspaceId || user?.workspace_id || 0)
      })
      setName("")
      setEmail("")
      setPhone("")
      setShowCreate(false)
      setMessage("User created")
      await loadUsers(pagination.page, pagination.size)
    } catch (err) {
      setError(err.message || "Could not create user")
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(item) {
    setInvitingUserId(item.id)
    setError("")
    setMessage("")
    try {
      const response = await inviteUser(item.email)
      setMessage(response.message || "Invite sent successfully")
    } catch (err) {
      setError(err.message || "Could not invite user")
    } finally {
      setInvitingUserId(null)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Remove this user?")
    if (!confirmed) return

    setRemovingUserId(id)
    setError("")
    setMessage("")
    try {
      await deleteUser(id)
      setMessage("User removed")
      await loadUsers(pagination.page, pagination.size)
    } catch (err) {
      setError(err.message || "Could not remove user")
    } finally {
      setRemovingUserId(null)
    }
  }

  function toggleCreateForm() {
    setShowCreate(value => !value)
    setMessage("")
    setError("")
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isAdmin && (
              <button onClick={toggleCreateForm} className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {showCreate ? "Close" : "New user"}
              </button>
            )}
          </div>
        </div>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}

        {isAdmin && showCreate && <form onSubmit={handleCreate} className="mb-6 rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create user</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input required className="min-w-0 rounded border p-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input required type="email" className="min-w-0 rounded border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input required className="min-w-0 rounded border p-2" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <select className="min-w-0 rounded border p-2" value={role} onChange={e => setRole(e.target.value)}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="mt-3 flex gap-3">
            <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300">
              {loading ? "Saving..." : "Create user"}
            </button>
          </div>
        </form>}

        <div className="overflow-hidden rounded border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] divide-y divide-gray-200 text-sm md:min-w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingUsers && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={isAdmin ? 5 : 4}>Loading users...</td>
                  </tr>
                )}
                {!loadingUsers && users.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900"><span className="block max-w-48 truncate" title={item.name || "Unnamed user"}>{item.name || "Unnamed user"}</span></td>
                    <td className="px-4 py-3 text-gray-700"><span className="block max-w-56 truncate" title={item.email}>{item.email}</span></td>
                    <td className="px-4 py-3 text-gray-700">{item.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{item.role}</span>
                    </td>
                    {isAdmin && <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleInvite(item)}
                          disabled={invitingUserId === item.id}
                          title={`Invite ${item.email}`}
                          aria-label={`Invite ${item.email}`}
                          className="inline-flex h-8 items-center gap-1 rounded border border-blue-200 px-3 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:text-blue-300"
                        >
                          <MailIcon />
                          {invitingUserId === item.id ? "Sending" : "Invite"}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={removingUserId === item.id}
                          title="Remove user"
                          aria-label="Remove user"
                          className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:text-red-300"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))}
                {!loadingUsers && users.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={isAdmin ? 5 : 4}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Page {pagination.page} of {Math.max(pagination.total_pages || 1, 1)}
            {pagination.total_items ? ` - ${pagination.total_items} users` : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loadingUsers || pagination.page <= 1}
              onClick={() => setPagination(current => ({ ...current, page: current.page - 1 }))}
              className="rounded border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loadingUsers || pagination.page >= Math.max(pagination.total_pages || 1, 1)}
              onClick={() => setPagination(current => ({ ...current, page: current.page + 1 }))}
              className="rounded border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default Users
