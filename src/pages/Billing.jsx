import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import PlanBadge from "../components/PlanBadge"
import { cancelSubscription, completeCheckoutSession, createCheckoutSession, getSubscriptionPlans, updateSubscription } from "../api/billing"

function formatPlanName(name) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "Plan"
}

function formatFeatureName(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatFeatureValue(value) {
  if (typeof value === "boolean") return value ? "Included" : "Not included"
  if (value === 999999) return "Unlimited"
  return value
}

function formatBillingDate(value) {
  if (!value) return "the end of your billing period"

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value))
}

// Shows simple billing actions for backend subscription routes.
function Billing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [plans, setPlans] = useState([])
  const [currentPlanId, setCurrentPlanId] = useState(null)
  const [currentPlanName, setCurrentPlanName] = useState("Free")
  const [subscription, setSubscription] = useState(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loadingPlan, setLoadingPlan] = useState("")
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [completingCheckout, setCompletingCheckout] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout")
    if (!checkoutStatus) return

    async function completeCheckout() {
      if (checkoutStatus === "success") {
        const sessionId = searchParams.get("session_id")

        if (!sessionId) {
          setError("Checkout completed, but the session id was missing.")
          setSearchParams({}, { replace: true })
          return
        }

        setCompletingCheckout(true)
        setError("")
        setMessage("Activating your subscription...")

        try {
          const response = await completeCheckoutSession(sessionId)
          setMessage(response.message || "Subscription activated successfully.")
          await loadPlans()
          setSearchParams({}, { replace: true })
        } catch (err) {
          setError(err.message || "Checkout completed, but activation failed. Please refresh in a moment.")
        } finally {
          setCompletingCheckout(false)
        }
      }

      if (checkoutStatus === "cancelled") {
        setMessage("Checkout cancelled. No payment was taken.")
        setSearchParams({}, { replace: true })
      }
    }

    completeCheckout()
  }, [searchParams, setSearchParams])

  async function loadPlans() {
    setLoadingPlans(true)
    setError("")
    try {
      const response = await getSubscriptionPlans()
      const data = response.data || {}
      setPlans(data.plans || [])
      setCurrentPlanId(data.current_plan_id || null)
      setCurrentPlanName(formatPlanName(data.current_plan_name || "Free"))
      setSubscription(data.subscription || null)
      setHasActiveSubscription(Boolean(data.has_active_subscription))
    } catch (err) {
      setError(err.message || "Could not load subscription plans")
    } finally {
      setLoadingPlans(false)
    }
  }

  async function handleSubscribe(planId, action) {
    setError("")
    setMessage("")
    const selectedPlan = plans.find(plan => plan.id === planId)

    if (selectedPlan && Number(selectedPlan.price) <= 0) {
      setLoadingPlan(`cancel-${planId}`)
      try {
        if (hasActiveSubscription) {
          const response = await cancelSubscription()
          await loadPlans()
          setMessage("")
        } else {
          setMessage("You are already on the Free plan.")
        }
      } catch (err) {
        setError(err.message || "Could not cancel subscription")
      } finally {
        setLoadingPlan("")
      }
      return
    }

    const nextAction = hasActiveSubscription ? "update" : action
    setLoadingPlan(`${nextAction}-${planId}`)
    let redirecting = false

    try {
      if (nextAction === "subscribe") {
        const response = await createCheckoutSession(planId)
        const checkoutUrl = response.data?.checkout_url

        if (!checkoutUrl) {
          throw new Error("Checkout URL was not returned")
        }

        redirecting = true
        setMessage("Redirecting to Stripe Checkout...")
        window.location.assign(checkoutUrl)
        return
      } else {
        const response = await updateSubscription(planId)
        setMessage(response.message || "Billing updated")
        await loadPlans()
      }
    } catch (err) {
      if (err.status === 400 && err.message === "An active subscription already exists. Please update your current subscription to change plans.") {
        try {
          const response = await updateSubscription(planId)
          setMessage(response.message || "Subscription updated")
          await loadPlans()
        } catch (updateErr) {
          setError(updateErr.message || "Could not update subscription")
        }
      } else {
        setError(err.message || "Billing failed")
      }
    } finally {
      if (!redirecting) {
        setLoadingPlan("")
      }
    }
  }

  async function handleCancel() {
    setError("")
    setMessage("")
    setCanceling(true)
    try {
      const response = await cancelSubscription()
      await loadPlans()
      setMessage("")
    } catch (err) {
      setError(err.message || "Could not cancel subscription")
    } finally {
      setCanceling(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Billing</h1>
          <PlanBadge plan={currentPlanName} />
        </div>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {subscription?.cancel_at_period_end && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Renewal canceled</p>
            <p className="mt-1">
              Your {currentPlanName} plan stays active until {formatBillingDate(subscription.current_period_end)}. After that, your workspace will move to Free.
            </p>
          </div>
        )}

        {(loadingPlans || completingCheckout) && <p className="rounded border bg-white p-4 text-gray-600">{completingCheckout ? "Activating subscription..." : "Loading plans..."}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map(plan => (
            <div key={plan.id} className={`rounded border bg-white p-4 shadow-sm ${plan.id === currentPlanId ? "border-blue-500 ring-1 ring-blue-200" : ""}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{formatPlanName(plan.name)}</h2>
                  <p className="text-sm text-gray-600">
                    {plan.price > 0 ? `$${plan.price}/month` : "Free"}
                  </p>
                </div>
                <span className={`max-w-32 rounded px-2 py-1 text-right text-xs sm:max-w-none ${plan.id === currentPlanId ? "bg-blue-100 font-semibold text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                  {plan.id === currentPlanId ? subscription?.cancel_at_period_end ? "Current until renewal" : "Current" : plan.is_active ? "Available" : "Inactive"}
                </span>
              </div>

              <dl className="mb-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">Tasks</dt>
                  <dd className="font-medium">{formatFeatureValue(plan.max_tasks)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">Users</dt>
                  <dd className="font-medium">{formatFeatureValue(plan.max_users)}</dd>
                </div>
                {Object.entries(plan.features || {})
                  .filter(([name]) => name !== "max_tasks" && name !== "max_users")
                  .map(([name, value]) => (
                    <div key={name} className="flex justify-between gap-4">
                      <dt className="text-gray-600">{formatFeatureName(name)}</dt>
                      <dd className="text-right font-medium">{formatFeatureValue(value)}</dd>
                    </div>
                  ))}
              </dl>

              {plan.id === currentPlanId ? (
                <button disabled className="rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">
                  Current plan
                </button>
              ) : (
                <button disabled={Boolean(loadingPlan) || completingCheckout || subscription?.cancel_at_period_end} onClick={() => handleSubscribe(plan.id, hasActiveSubscription ? "update" : "subscribe")} className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:bg-blue-300">
                  {loadingPlan === `cancel-${plan.id}`
                    ? "Canceling..."
                    : loadingPlan === `subscribe-${plan.id}` || loadingPlan === `update-${plan.id}`
                    ? hasActiveSubscription ? "Updating..." : "Redirecting..."
                    : subscription?.cancel_at_period_end ? "Renewal canceled"
                    : Number(plan.price) <= 0 && hasActiveSubscription ? "Cancel renewal"
                    : hasActiveSubscription ? "Update plan" : "Subscribe"}
                </button>
              )}
            </div>
          ))}
          {!loadingPlans && plans.length === 0 && <p className="rounded border bg-white p-4 text-gray-600">No subscription plans found.</p>}
        </div>

        <button onClick={handleCancel} disabled={canceling || subscription?.cancel_at_period_end || !hasActiveSubscription} className="mt-6 rounded bg-red-600 px-4 py-2 text-white disabled:bg-red-300">
          {canceling ? "Canceling..." : subscription?.cancel_at_period_end ? "Renewal already canceled" : "Cancel renewal"}
        </button>
      </main>
    </>
  )
}

export default Billing
