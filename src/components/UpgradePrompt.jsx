import { Link } from "react-router-dom"

// Shows an upgrade message for plan limits.
function UpgradePrompt({ message }) {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="mb-3">{message || "This action needs a higher plan."}</p>
      <Link to="/billing" className="rounded bg-amber-600 px-3 py-2 text-white">
        Upgrade plan
      </Link>
    </div>
  )
}

export default UpgradePrompt
