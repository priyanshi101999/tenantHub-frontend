import { Link } from "react-router-dom"

// Shows one task and simple update controls.
function TaskCard({ task, users, onUpdate, onUpload }) {
  function toUpdateData(overrides) {
    return {
      title: task.title,
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      due_date: task.due_date || null,
      assignee_id: task.assignee_id || null,
      ...overrides
    }
  }

  function changeStatus(event) {
    onUpdate(task.id, toUpdateData({ status: event.target.value }))
  }

  function changeAssignee(event) {
    const value = event.target.value
    onUpdate(task.id, toUpdateData({ assignee_id: value ? Number(value) : null }))
  }

  function handleFile(event) {
    const file = event.target.files[0]
    if (file) onUpload(task.id, file)
  }

  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description || "No description"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50" to={`/tasks/${task.id}/edit`}>
            Edit
          </Link>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">{task.priority}</span>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <select className="rounded border p-2" value={task.status || "TODO"} onChange={changeStatus}>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="OVERDUE">Overdue</option>
          <option value="DONE">Done</option>
        </select>

        <select className="rounded border p-2" value={task.assignee_id || ""} onChange={changeAssignee}>
          <option value="">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name || user.email}</option>
          ))}
        </select>

        <input className="rounded border p-2" type="file" onChange={handleFile} />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Due: {task.due_date ? new Date(task.due_date).toLocaleString() : "No due date"}
      </p>
    </div>
  )
}

export default TaskCard
