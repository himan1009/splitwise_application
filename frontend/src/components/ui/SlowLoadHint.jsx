import { DEFAULT_SLOW_MESSAGE, useSlowLoadHint } from "../../hooks/useSlowLoadHint";

export default function SlowLoadHint({
  active = false,
  message = DEFAULT_SLOW_MESSAGE,
  compact = false,
  className = "",
}) {
  const showSlowHint = useSlowLoadHint(active);

  if (!showSlowHint) return null;

  return (
    <div
      className={`slow-load-hint ${compact ? "slow-load-hint-compact" : ""} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="slow-load-hint-icon" aria-hidden>
        <span className="slow-load-hint-pulse" />
        <span>⏳</span>
      </div>
      <div className="min-w-0">
        <p className="slow-load-hint-title">Taking longer than usual</p>
        <p className="slow-load-hint-text">{message}</p>
      </div>
    </div>
  );
}
