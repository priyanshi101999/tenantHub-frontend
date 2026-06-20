import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import TaskForm from "../components/TaskForm"
import UpgradePrompt from "../components/UpgradePrompt"
import { getSubscriptionPlans } from "../api/billing"
import { createTask, deleteTask, deleteTaskAttachment, getTasks, openTaskAttachment, uploadTaskFile } from "../api/tasks"
import { getUsers } from "../api/workspace"

function formatStatus(value) {
  return (value || "TODO").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatDate(value) {
  if (!value) return "No due date"
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value))
}

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

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

// Shows task list, filters, and task creation.
function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ task_status: "", priority: "", assignee_id: "", overdue: false, page: 1, size: 10 })
  const [pagination, setPagination] = useState({ page: 1, size: 10, total_items: 0, total_pages: 1 })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [removingTaskId, setRemovingTaskId] = useState(null)
  const [removingAttachmentId, setRemovingAttachmentId] = useState(null)
  const [uploadingTaskId, setUploadingTaskId] = useState(null)
  const [canUploadFiles, setCanUploadFiles] = useState(false)

  useEffect(() => {
    loadUsers()
    loadPlanFeatures()
  }, [])

  useEffect(() => {
    loadTasks(filters)
  }, [filters])

  useEffect(() => {
    if (!message && !error && !upgradeMessage) return

    const timer = window.setTimeout(() => {
      setMessage("")
      setError("")
      setUpgradeMessage("")
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [message, error, upgradeMessage])

  async function loadTasks(nextFilters = filters) {
    setError("")
    setLoadingTasks(true)
    try {
      const response = await getTasks(nextFilters)
      setTasks(response.data?.tasks || [])
      setPagination(previousPagination => ({
        ...previousPagination,
        ...(response.data?.pagination || {}),
        page: nextFilters.page || 1,
        size: nextFilters.size || 10
      }))
    } catch (err) {
      setError(err.message || "Could not load tasks")
    } finally {
      setLoadingTasks(false)
    }
  }

  async function loadUsers() {
    try {
      const response = await getUsers(1, 100)
      setUsers(response.data?.users || [])
    } catch {
      setUsers([])
    }
  }

  async function loadPlanFeatures() {
    try {
      const response = await getSubscriptionPlans()
      const data = response.data || {}
      const currentPlan = (data.plans || []).find(plan => plan.id === data.current_plan_id)
      setCanUploadFiles(Boolean(currentPlan?.features?.file_attachments))
    } catch {
      setCanUploadFiles(false)
    }
  }

  async function handleCreate(data) {
    setLoading(true)
    setUpgradeMessage("")
    setMessage("")
    try {
      const { attachment, ...taskData } = data
      const response = await createTask(taskData)
      const createdTaskId = response.data?.id

      if (attachment && createdTaskId) {
        await uploadTaskFile(createdTaskId, attachment)
      }

      setShowCreate(false)
      setMessage(attachment ? "Task created and file uploaded" : "Task created")
      await loadTasks()
    } catch (err) {
      if (err.status === 403) setUpgradeMessage(err.message)
      else setError(err.message || "Could not create task")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Remove this task?")
    if (!confirmed) return

    setRemovingTaskId(id)
    setError("")
    setMessage("")
    try {
      await deleteTask(id)
      setMessage("Task removed")
      await loadTasks()
    } catch (err) {
      setError(err.message || "Could not remove task")
    } finally {
      setRemovingTaskId(null)
    }
  }

  async function handleUpload(id, file) {
    if (!file) return

    setUploadingTaskId(id)
    setError("")
    setMessage("")
    setUpgradeMessage("")

    try {
      await uploadTaskFile(id, file)
      setMessage("File uploaded")
      await loadTasks()
    } catch (err) {
      if (err.status === 403) setUpgradeMessage(err.message)
      else setError(err.message || "Could not upload file")
    } finally {
      setUploadingTaskId(null)
    }
  }

  async function handleOpenAttachment(attachmentId) {
    setError("")
    try {
      await openTaskAttachment(attachmentId)
    } catch (err) {
      setError(err.message || "Could not open file")
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    const confirmed = window.confirm("Delete this uploaded file?")
    if (!confirmed) return

    setRemovingAttachmentId(attachmentId)
    setError("")
    setMessage("")
    try {
      await deleteTaskAttachment(attachmentId)
      setMessage("File deleted")
      await loadTasks()
    } catch (err) {
      setError(err.message || "Could not delete file")
    } finally {
      setRemovingAttachmentId(null)
    }
  }

  function applyFilters(event) {
    event.preventDefault()
    loadTasks(filters)
  }

  function updateFilters(updates) {
    setFilters(previousFilters => ({
      ...previousFilters,
      ...updates,
      page: 1
    }))
  }

  function toggleCreateForm() {
    setShowCreate(value => !value)
    setMessage("")
    setError("")
    setUpgradeMessage("")
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <div className="flex gap-2">
            <button onClick={toggleCreateForm} className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">
              {showCreate ? "Close" : "New task"}
            </button>
          </div>
        </div>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {upgradeMessage && <div className="mb-4"><UpgradePrompt message={upgradeMessage} /></div>}
        {showCreate && <div className="mb-6"><TaskForm users={users} onSubmit={handleCreate} loading={loading} allowAttachment={canUploadFiles} /></div>}

        <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded border bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
          <select className="min-w-0 rounded border p-2" value={filters.task_status} onChange={e => updateFilters({ task_status: e.target.value })}>
            <option value="">Any status</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DONE">Done</option>
          </select>
          <select className="min-w-0 rounded border p-2" value={filters.priority} onChange={e => updateFilters({ priority: e.target.value })}>
            <option value="">Any priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select className="min-w-0 rounded border p-2" value={filters.assignee_id} onChange={e => updateFilters({ assignee_id: e.target.value })}>
            <option value="">Any assignee</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={filters.overdue} onChange={e => updateFilters({ overdue: e.target.checked })} />
            Overdue
          </label>
        </form>

        <div className="overflow-hidden rounded border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] divide-y divide-gray-200 text-sm lg:min-w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Attachments</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTasks && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan="8">Loading tasks...</td>
                  </tr>
                )}
                {!loadingTasks && tasks.map(task => {
                  const assignee = users.find(user => user.id === task.assignee_id)

                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="max-w-48 truncate font-medium text-gray-900" title={task.title}>{task.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-xs whitespace-normal text-gray-700">{task.description || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        {task.attachments?.length > 0 && (
                          <div className="flex max-w-xs flex-col gap-2">
                            {task.attachments.map(attachment => (
                              <div key={attachment.id} className="flex max-w-full min-w-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttachment(attachment.id)}
                                  className="inline-flex min-w-0 flex-1 items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                  title={attachment.file_name}
                                >
                                  <span className="flex-none"><FileIcon /></span>
                                  <span className="truncate">{attachment.file_name}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(attachment.id)}
                                  disabled={removingAttachmentId === attachment.id}
                                  title="Delete file"
                                  aria-label="Delete file"
                                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:text-red-300"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(!task.attachments || task.attachments.length === 0) && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{formatStatus(task.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatStatus(task.priority)}</td>
                      <td className="px-4 py-3 text-gray-700">{assignee?.name || assignee?.email || "Unassigned"}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(task.due_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" to={`/tasks/${task.id}/edit`}>
                            Edit
                          </Link>
                          {canUploadFiles && (
                            <label
                              title="Upload file"
                              aria-label="Upload file"
                              className={`inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-50 ${uploadingTaskId === task.id ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            >
                              <UploadIcon />
                              <input
                                className="sr-only"
                                type="file"
                                disabled={uploadingTaskId === task.id}
                                onChange={event => {
                                  handleUpload(task.id, event.target.files?.[0])
                                  event.target.value = ""
                                }}
                              />
                            </label>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            disabled={removingTaskId === task.id}
                            title="Remove task"
                            aria-label="Remove task"
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:text-red-300"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!loadingTasks && tasks.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan="8">No tasks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Page {pagination.page} of {Math.max(pagination.total_pages || 1, 1)}
            {pagination.total_items ? ` - ${pagination.total_items} tasks` : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loadingTasks || filters.page <= 1}
              onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}
              className="rounded border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loadingTasks || filters.page >= Math.max(pagination.total_pages || 1, 1)}
              onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}
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

export default Tasks
