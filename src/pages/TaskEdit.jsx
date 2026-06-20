import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import TaskForm from "../components/TaskForm"
import { getSubscriptionPlans } from "../api/billing"
import { deleteTaskAttachment, getTask, openTaskAttachment, updateTask, uploadTaskFile } from "../api/tasks"
import { getUsers } from "../api/workspace"

function FileIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
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

// Shows a dedicated page for editing one task.
function TaskEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removingAttachmentId, setRemovingAttachmentId] = useState(null)
  const [canUploadFiles, setCanUploadFiles] = useState(false)

  useEffect(() => {
    loadPage()
  }, [id])

  useEffect(() => {
    if (!message && !error) return

    const timer = window.setTimeout(() => {
      setMessage("")
      setError("")
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [message, error])

  async function loadPage() {
    setLoading(true)
    setError("")
    try {
      const [taskResponse, usersResponse] = await Promise.all([
        getTask(id),
        getUsers(1, 100)
      ])
      setTask(taskResponse.data)
      setUsers(usersResponse.data?.users || [])
      await loadPlanFeatures()
    } catch (err) {
      setError(err.message || "Could not load task")
    } finally {
      setLoading(false)
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

  async function handleSubmit(data) {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const { attachment, ...taskData } = data
      await updateTask(id, taskData)

      if (attachment) {
        await uploadTaskFile(id, attachment)
      }

      navigate("/tasks")
    } catch (err) {
      setError(err.message || "Could not update task")
    } finally {
      setSaving(false)
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
      await loadPage()
    } catch (err) {
      setError(err.message || "Could not delete file")
    } finally {
      setRemovingAttachmentId(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Edit task</h1>
          <Link className="inline-flex w-full justify-center rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto" to="/tasks">
            Back to tasks
          </Link>
        </div>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {loading && <p className="rounded border bg-white p-4 text-gray-600">Loading task...</p>}
        {!loading && task && (
          <>
            <TaskForm
              users={users}
              onSubmit={handleSubmit}
              loading={saving}
              initialTask={task}
              formTitle="Task details"
              submitLabel="Save changes"
              submittingLabel="Saving..."
              resetOnSubmit={false}
              allowAttachment={canUploadFiles}
            />

            <section className="mt-6 min-w-0 rounded border bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Uploaded files</h2>
              {task.attachments?.length > 0 ? (
                <div className="grid gap-2">
                  {task.attachments.map(attachment => (
                    <div key={attachment.id} className="flex min-w-0 items-center justify-between gap-3 rounded border border-gray-200 p-3">
                      <button
                        type="button"
                        onClick={() => handleOpenAttachment(attachment.id)}
                        className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-800 hover:text-blue-700"
                        title={attachment.file_name}
                      >
                        <span className="flex-none"><FileIcon /></span>
                        <span className="truncate">{attachment.file_name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        disabled={removingAttachmentId === attachment.id}
                        className="inline-flex h-8 w-8 flex-none items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:text-red-300"
                        title="Delete file"
                        aria-label="Delete file"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No files uploaded.</p>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}

export default TaskEdit
