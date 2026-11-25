import { formatCurrency } from "../../utils/format";

export default function CashflowAreaChart({ buckets = [] }) {
  if (buckets.length < 2) {
    return (
      <p className="text-dim text-sm text-center py-8">
        Need at least 2 months in this period for a cashflow line.
      </p>
    );
  }

  const width = 320;
  const height = 120;
  const pad = 8;
  const balances = buckets.map((b) => b.balance);
  const min = Math.min(...balances, 0);
  const max = Math.max(...balances, 1);
  const span = max - min || 1;

  const points = balances.map((bal, i) => {
    const x = pad + (i / (balances.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (bal - min) / span) * (height - pad * 2);
    return `${x},${y}`;
  });

  const area = `${pad},${height - pad} ${points.join(" ")} ${width - pad},${height - pad}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="insights-area-chart" role="img" aria-label="Net balance trend">
      <defs>
        <linearGradient id="insightsAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(29, 158, 117, 0.45)" />
          <stop offset="100%" stopColor="rgba(29, 158, 117, 0.02)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#insightsAreaFill)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#1d9e75"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x={pad} y={height - 2} className="insights-area-caption">
        Low {formatCurrency(min)} · High {formatCurrency(max)}
      </text>
    </svg>
  );
}