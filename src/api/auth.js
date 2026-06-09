import { apiRequest } from "./apiClient"

// Registers the first admin user and workspace.
export function registerUser(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// Logs in a user with email and password.
export function loginUser(data) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRedirect: true
  })
}

// Sends an email OTP to the user.
export function sendEmailOtp(email) {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email })
  })
}

// Verifies the email OTP code.
export function verifyEmailOtp(data) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// Changes the current user's password.
export function changePassword(data) {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// Sends a password reset OTP to the user's email.
export function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRedirect: true
  })
}

// Resets a password using the email OTP code.
export function resetPassword(data) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRedirect: true
  })
}

// Sets a password for an invited user using the invite secret token.
export function setInvitePassword(data) {
  return apiRequest("/auth/set-password", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRedirect: true
  })
}

// Sends a device token to the backend.
export function saveFcmToken(data) {
  return apiRequest("/auth/save-fcm-token", {
    method: "POST",
    body: JSON.stringify(data)
  })
}
