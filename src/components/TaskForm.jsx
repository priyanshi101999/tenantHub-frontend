import { useEffect, useState } from "react"

function toDateTimeLocal(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

// Shows the task create/edit form.
function TaskForm({ users, onSubmit, loading, initialTask = null, formTitle = "Create task", submitLabel = "Create task", submittingLabel = "Saving...", resetOnSubmit = true, allowAttachment = false }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [status, setStatus] = useState("TODO")
  const [attachment, setAttachment] = useState(null)

  useEffect(() => {
    setTitle(initialTask?.title || "")
    setDescription(initialTask?.description || "")
    setAssigneeId(initialTask?.assignee_id ? String(initialTask.assignee_id) : "")
    setDueDate(toDateTimeLocal(initialTask?.due_date))
    setPriority(initialTask?.priority || "MEDIUM")
    setStatus(initialTask?.status || "TODO")
  }, [initialTask])

  async function handleSubmit(event) {
    event.preventDefault()
    const data = {
      title,
      description,
      status,
      assignee_id: assigneeId ? Number(assigneeId) : null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority
    }

    if (allowAttachment) {
      data.attachment = attachment
    }

    await onSubmit(data)
    if (resetOnSubmit) {
      setTitle("")
      setDescription("")
      setAssigneeId("")
      setDueDate("")
      setPriority("MEDIUM")
      setStatus("TODO")
      setAttachment(null)
      event.target.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 rounded border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{formTitle}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="min-w-0 rounded border p-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <select className="min-w-0 rounded border p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="OVERDUE">Overdue</option>
          <option value="DONE">Done</option>
        </select>
        <select className="min-w-0 rounded border p-2" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select className="min-w-0 rounded border p-2" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
          <option value="">Unassigned</option>
          {users.map(user => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
        </select>
        <input className="min-w-0 rounded border p-2" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        {allowAttachment && (
          <input
            className="min-w-0 rounded border p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={e => setAttachment(e.target.files?.[0] || null)}
          />
        )}
      </div>
      <textarea className="mt-3 w-full min-w-0 rounded border p-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button disabled={loading} className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300">
        {loading ? submittingLabel : submitLabel}
      </button>
    </form>
  )
}

export default TaskForm
