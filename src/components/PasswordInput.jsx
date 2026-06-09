import { useState } from "react"

function EyeIcon({ visible }) {
  return visible ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 4.24A10.8 10.8 0 0 1 12 4c5 0 9 4.5 10 8a11.8 11.8 0 0 1-3.08 4.78" />
      <path d="M6.1 6.1A11.8 11.8 0 0 0 2 12c1 3.5 5 8 10 8a10.8 10.8 0 0 0 4.02-.78" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PasswordInput({ wrapperClassName = "mb-4", className = "", ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`w-full rounded border p-2 pr-10 ${className}`}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(current => !current)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  )
}

export default PasswordInput
