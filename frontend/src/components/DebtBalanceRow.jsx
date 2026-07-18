import { formatCurrency } from "../utils/format";

export default function DebtBalanceRow({ name, amount, onClick, compact = false }) {
  const isOwed = amount > 0;
  const isSettled = Math.abs(amount) < 0.01;
  const absAmount = Math.abs(amount);

  const statusLabel = isSettled ? "Settled up" : isOwed ? "Owes you" : "You owe";
  const rowClass = isSettled
    ? "debt-balance-row debt-balance-row-settled"
    : isOwed
    ? "debt-balance-row debt-balance-row-in"
    : "debt-balance-row debt-balance-row-out";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`${rowClass} ${onClick ? "debt-balance-row-clickable" : ""} ${compact ? "debt-balance-row-compact" : ""}`}
    >
      <div className="debt-balance-person">
        <div className="app-avatar debt-balance-avatar">{name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 text-left">
          <p className="debt-balance-name">{name}</p>
          <p className="debt-balance-status">{statusLabel}</p>
        </div>
      </div>

      <div className="debt-balance-amount-block">
        {!isSettled && (
          <span className={`debt-balance-direction ${isOwed ? "debt-balance-direction-in" : "debt-balance-direction-out"}`}>
            {isOwed ? "↓" : "↑"}
          </span>
        )}
        <p className={`debt-balance-amount ${isSettled ? "debt-balance-amount-settled" : isOwed ? "debt-balance-amount-in" : "debt-balance-amount-out"}`}>
          {isSettled ? "✓" : formatCurrency(absAmount)}
        </p>
      </div>
    </Wrapper>
  );
}
