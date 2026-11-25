export default function TransactionToolbar({
  query,
  onQueryChange,
  type,
  onTypeChange,
  lens,
  onLensChange,
  sortBy,
  onSortChange,
  onExport,
  resultCount,
  totalCount,
}) {
  return (
    <div className="txn-toolbar">
      <input
        type="search"
        className="input txn-search"
        placeholder="Search category, note…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoComplete="off"
      />

      <div className="txn-chip-row" role="group" aria-label="Transaction type">
        {[
          { id: "all", label: "All" },
          { id: "expense", label: "Expenses" },
          { id: "income", label: "Income" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={type === t.id ? "txn-chip txn-chip-active" : "txn-chip"}
            onClick={() => onTypeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="txn-chip-row" role="group" aria-label="Category lens">
        {[
          { id: "all", label: "Every category" },
          { id: "essential", label: "Essentials" },
          { id: "lifestyle", label: "Lifestyle" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={lens === t.id ? "txn-chip txn-chip-active" : "txn-chip"}
            onClick={() => onLensChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="txn-toolbar-actions">
        <label className="txn-sort-field">
          <span className="txn-field-label">Sort</span>
          <select
            className="input input-select txn-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort transactions"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </label>
        <button type="button" className="btn-secondary txn-export-btn" onClick={onExport}>
          Export CSV
        </button>
      </div>

      <p className="txn-toolbar-meta text-xs text-dim">
        Showing {resultCount} of {totalCount} transaction{totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}