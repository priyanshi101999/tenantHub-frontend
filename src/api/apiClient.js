export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

// Reads the saved token for protected API calls.
export function getToken() {
  return localStorage.getItem("token")
}

// Sends a JSON request to the backend and returns the parsed response.
export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}) }

  if (!options.isFormData) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (response.status === 401 && !options.skipAuthRedirect) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  if (!response.ok) {
    const message = data.detail || data.message || "Request failed"
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
