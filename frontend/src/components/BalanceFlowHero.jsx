import { formatCurrency } from "../utils/format";

export default function BalanceFlowHero({ otherName, net, myName = "You" }) {
  const isSettled = Math.abs(net) < 0.01;
  const isOwed = net > 0;
  const absAmount = Math.abs(net);

  const heroClass = isSettled
    ? "balance-flow-hero balance-flow-hero-neutral"
    : isOwed
    ? "balance-flow-hero balance-flow-hero-in"
    : "balance-flow-hero balance-flow-hero-out";

  const fromParty = isOwed ? otherName : myName;
  const toParty = isOwed ? myName : otherName;
  const fromInitial = fromParty.charAt(0).toUpperCase();
  const toInitial = toParty.charAt(0).toUpperCase();

  return (
    <div className={heroClass}>
      <div className="balance-flow-inner">
        <div className="balance-flow-party">
          <div className="balance-flow-avatar">{fromInitial}</div>
          <p className="balance-flow-party-name">{fromParty}</p>
          <p className="balance-flow-party-role">pays</p>
        </div>

        <div className="balance-flow-center">
          <p className="balance-flow-amount">
            {isSettled ? "—" : formatCurrency(absAmount)}
          </p>
          <div className="balance-flow-line" aria-hidden="true">
            <span className="balance-flow-dot" />
            <span className="balance-flow-arrow">→</span>
            <span className="balance-flow-dot" />
          </div>
          <p className="balance-flow-label">
            {isSettled ? "All settled" : isOwed ? "You'll receive" : "You need to pay"}
          </p>
        </div>

        <div className="balance-flow-party">
          <div className="balance-flow-avatar balance-flow-avatar-to">{toInitial}</div>
          <p className="balance-flow-party-name">{toParty}</p>
          <p className="balance-flow-party-role">receives</p>
        </div>
      </div>
    </div>
  );
}
