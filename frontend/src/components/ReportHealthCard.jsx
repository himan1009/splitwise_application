const TONE_STYLES = {
  success: {
    ring: "#34d399",
    badge: "health-badge-success",
    score: "health-score-tone-success",
  },
  info: {
    ring: "#22d3ee",
    badge: "health-badge-info",
    score: "health-score-tone-info",
  },
  warning: {
    ring: "#fbbf24",
    badge: "health-badge-warning",
    score: "health-score-tone-warning",
  },
  danger: {
    ring: "#f87171",
    badge: "health-badge-danger",
    score: "health-score-tone-danger",
  },
};

export default function ReportHealthCard({ score, health }) {
  const tone = TONE_STYLES[health.tone] || TONE_STYLES.info;
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className={`report-health-card ${tone.badge}`}>
      <div
        className="health-progress-ring"
        style={{
          "--progress": clampedScore,
          "--ring-color": tone.ring,
        }}
        aria-hidden
      >
        <div className="health-progress-ring-inner">
          <span className={`health-progress-score ${tone.score}`}>{clampedScore}</span>
        </div>
      </div>

      <div className="report-health-content min-w-0 flex-1">
        <p className="report-health-eyebrow">Financial Health</p>
        <div className="report-health-title-row">
          <span className="report-health-icon" aria-hidden>
            {health.icon}
          </span>
          <h3 className="report-health-label">{health.label}</h3>
        </div>
        <p className="report-health-hint">{health.hint}</p>
        <div className="health-progress-bar-track mt-3">
          <div
            className="health-progress-bar-fill"
            style={{
              width: `${clampedScore}%`,
              background: tone.ring,
            }}
          />
        </div>
        <p className="report-health-scale text-xs text-dim mt-1.5">
          Score: {clampedScore}/100
        </p>
      </div>
    </div>
  );
}
