export default function SplitDonut({ essential = 0, discretionary = 0, other = 0 }) {
  const total = essential + discretionary + other || 1;
  const ePct = (essential / total) * 100;
  const dPct = (discretionary / total) * 100;
  const oPct = 100 - ePct - dPct;

  const gradient = `conic-gradient(
    #1d9e75 0% ${ePct}%,
    #f59e0b ${ePct}% ${ePct + dPct}%,
    #64748b ${ePct + dPct}% 100%
  )`;

  return (
    <div className="insights-donut-wrap">
      <div className="insights-donut" style={{ background: gradient }}>
        <div className="insights-donut-hole">
          <span className="text-xs text-dim">Spend mix</span>
        </div>
      </div>
      <ul className="insights-donut-legend">
        <li>
          <span className="dot dot-essential" /> Essentials {ePct.toFixed(0)}%
        </li>
        <li>
          <span className="dot dot-discretionary" /> Lifestyle {dPct.toFixed(0)}%
        </li>
        <li>
          <span className="dot dot-other" /> Other {Math.max(0, oPct).toFixed(0)}%
        </li>
      </ul>
    </div>
  );
}