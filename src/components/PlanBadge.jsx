// Shows a small plan label.
function PlanBadge({ plan }) {
  const name = plan || "Free"
  const color = name.toLowerCase() === "free" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"

  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${color}`}>
      {name}
    </span>
  )
}

export default PlanBadge
