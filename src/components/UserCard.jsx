// Shows one user row with a remove button.
function UserCard({ user, onDelete, loading }) {
  return (
    <div className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
      <div>
        <p className="font-semibold">{user.name || "Unnamed user"}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
      <button
        onClick={() => onDelete(user.id)}
        disabled={loading}
        className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:bg-red-300"
      >
        Remove
      </button>
    </div>
  )
}

export default UserCard
