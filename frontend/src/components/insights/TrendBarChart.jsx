import { formatCurrency, formatMonth } from "../../utils/format";

export default function TrendBarChart({ buckets = [], maxBars = 12 }) {
  const data = buckets.slice(-maxBars);
  if (!data.length) {
    return (
      <p className="text-dim text-sm text-center py-10">Add transactions to see period trends.</p>
    );
  }

  const maxVal = Math.max(
    ...data.flatMap((b) => [b.income, b.expenses]),
    1
  );

  return (
    <div className="insights-trend-chart">
      <div className="insights-trend-legend">
        <span className="insights-legend-income">Income</span>
        <span className="insights-legend-expense">Spent</span>
      </div>
      <div className="insights-trend-bars">
        {data.map((b) => {
          const incH = (b.income / maxVal) * 100;
          const expH = (b.expenses / maxVal) * 100;
          const label = b.month?.length === 7 ? formatMonth(b.month).split(" ")[0] : b.month;
          return (
            <div key={b.month} className="insights-trend-col">
              <div className="insights-trend-bar-group">
                <div
                  className="insights-trend-bar insights-trend-bar-income"
                  style={{ height: `${incH}%` }}
                  title={`Income ${formatCurrency(b.income)}`}
                />
                <div
                  className="insights-trend-bar insights-trend-bar-expense"
                  style={{ height: `${expH}%` }}
                  title={`Spent ${formatCurrency(b.expenses)}`}
                />
              </div>
              <span className="insights-trend-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}