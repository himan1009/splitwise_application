export default function SecurityNotice({ title = "How we keep your data safe", compact = false }) {
  const points = [
    "Only you can access your tracker, groups, and debts when logged in.",
    "Debt edits are allowed only for entries you recorded.",
    "Group expenses are visible only to members of that group.",
    "Login and password reset are rate-limited to reduce abuse.",
  ];

  if (compact) {
    return (
      <p className="text-xs text-dim leading-relaxed">
        {points[1]} · {points[3]}
      </p>
    );
  }

  return (
    <div className="card security-notice-card !p-4">
      <h3 className="text-sm font-bold text-slate-200 mb-2">🔒 {title}</h3>
      <ul className="text-xs text-dim space-y-1.5 list-disc pl-4">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}