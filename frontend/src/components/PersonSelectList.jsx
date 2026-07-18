import { useMemo, useState } from "react";

export default function PersonSelectList({
  users,
  value,
  onChange,
  multiple = false,
  disabledIds = [],
  searchPlaceholder = "Search by name or email",
  emptyMessage = "No people found",
  maxHeight = "16rem",
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, search]);

  const isSelected = (id) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(id);
    }
    return value === id;
  };

  const handleSelect = (id) => {
    if (disabledIds.includes(id)) return;

    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      onChange(
        current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id]
      );
      return;
    }

    onChange(id);
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        className="input"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="member-select-list" style={{ maxHeight }}>
        {filteredUsers.length === 0 ? (
          <p className="text-center text-dim text-sm py-6">{emptyMessage}</p>
        ) : (
          filteredUsers.map((user) => {
            const selected = isSelected(user._id);
            const disabled = disabledIds.includes(user._id);

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => handleSelect(user._id)}
                disabled={disabled}
                className={`member-select-item member-select-item-single ${
                  disabled
                    ? "member-select-item-admin"
                    : selected
                    ? "member-select-item-selected"
                    : ""
                }`}
              >
                <div className="app-avatar !w-9 !h-9 !text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {user.name}
                    {disabled && (
                      <span className="ml-2 text-xs text-cyan-400 font-semibold">
                        You · Admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-dim truncate">{user.email}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                    selected
                      ? "border-indigo-400 bg-indigo-500 text-white"
                      : "border-white/20 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
