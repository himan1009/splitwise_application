export default function AmountInput({
  value,
  onChange,
  className = "",
  placeholder = "0",
  size = "default",
  showPrefix = true,
  ...props
}) {
  const handleChange = (e) => {
    const next = e.target.value;
    if (next === "" || /^\d*\.?\d{0,2}$/.test(next)) {
      onChange(next);
    }
  };

  const isLarge = size === "lg";

  return (
    <div className={`amount-input-wrap ${isLarge ? "amount-input-wrap-lg" : ""} ${!showPrefix ? "amount-input-wrap-no-prefix" : ""}`}>
      {showPrefix && <span className="amount-input-prefix">₹</span>}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={`input amount-input ${isLarge ? "amount-input-lg" : ""} ${className}`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
