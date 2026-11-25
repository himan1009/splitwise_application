export function BrandWordmark({ size = "md", className = "" }) {
  const scale =
    size === "sm"
      ? "brand-wordmark-sm"
      : size === "lg"
      ? "brand-wordmark-lg"
      : "brand-wordmark-md";

  return (
    <span className={`brand-wordmark ${scale} ${className}`.trim()}>
      <span className="brand-wordmark-fin">Fin</span>
      <span className="brand-wordmark-track">Track</span>
    </span>
  );
}