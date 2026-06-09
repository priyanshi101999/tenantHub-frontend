import { apiRequest } from "./apiClient"

// Gets available subscription plans from the backend.
export function getSubscriptionPlans() {
  return apiRequest("/subscription/plans")
}

// Creates a Stripe Checkout Session for the selected backend plan id.
export function createCheckoutSession(planId) {
  return apiRequest(`/subscription/checkout?plan_id=${planId}`, {
    method: "POST"
  })
}

// Verifies a completed Stripe Checkout Session and activates the local subscription.
export function completeCheckoutSession(sessionId) {
  return apiRequest(`/subscription/checkout/complete?session_id=${sessionId}`, {
    method: "POST"
  })
}

// Updates the active subscription to another backend plan id.
export function updateSubscription(planId) {
  return apiRequest(`/subscription/update?plan_id=${planId}`, {
    method: "POST"
  })
}

// Cancels the current subscription.
export function cancelSubscription() {
  return apiRequest("/subscription/cancel", {
    method: "POST"
  })
}
