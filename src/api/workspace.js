import { apiRequest } from "./apiClient"

// Gets workspace users.
export function getUsers(page = 1, size = 10) {
  return apiRequest(`/user/list?page=${page}&size=${size}`)
}

// Creates a user in the current workspace.
export function createUser(data) {
  return apiRequest("/user/create", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// Sends an invite email to an existing user.
export function inviteUser(email) {
  return apiRequest("/user/invite", {
    method: "POST",
    body: JSON.stringify({ email })
  })
}

// Deletes a user by id.
export function deleteUser(id) {
  return apiRequest(`/user/?id=${id}`, {
    method: "DELETE"
  })
}
