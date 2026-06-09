import { API_BASE_URL, apiRequest, getToken } from "./apiClient"

// Gets tasks with simple filters.
export function getTasks(filters) {
  const params = new URLSearchParams()
  params.set("page", filters.page || 1)
  params.set("size", filters.size || 10)
  if (filters.task_status) params.set("task_status", filters.task_status)
  if (filters.priority) params.set("priority", filters.priority)
  if (filters.assignee_id) params.set("assignee_id", filters.assignee_id)
  if (filters.overdue) params.set("overdue", "true")
  return apiRequest(`/task/list?${params.toString()}`)
}

// Gets one task by id.
export function getTask(id) {
  return apiRequest(`/task/?id=${id}`)
}

// Creates a task.
export function createTask(data) {
  return apiRequest("/task/create", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// Updates a task by id.
export function updateTask(id, data) {
  return apiRequest(`/task/update?id=${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}

// Soft-removes a task by id.
export function deleteTask(id) {
  return apiRequest(`/task/?id=${id}`, {
    method: "DELETE"
  })
}

// Gets task analytics.
export function getTaskAnalytics() {
  return apiRequest("/task/analytics")
}

// Uploads an attachment for a task.
export function uploadTaskFile(taskId, file) {
  const formData = new FormData()
  formData.append("file", file)
  return apiRequest(`/task/attachment?task_id=${taskId}`, {
    method: "POST",
    body: formData,
    isFormData: true
  })
}

// Deletes one uploaded attachment from a task.
export function deleteTaskAttachment(attachmentId) {
  return apiRequest(`/task/attachment/delete?attachment_id=${attachmentId}`, {
    method: "POST"
  })
}

// Opens a protected task attachment in a new browser tab.
export async function openTaskAttachment(attachmentId) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/task/attachment/open?attachment_id=${attachmentId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || data.message || "Could not open file")
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}
