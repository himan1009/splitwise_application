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
    <div className="txn-toolbar space-y-3">
      <input
        type="search"
        className="input !py-2.5"
        placeholder="Search category, note…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoComplete="off"
      />
      <div className="flex flex-wrap gap-2">
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
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Every category" },
            { id: "essential", label: "Essentials only" },
            { id: "lifestyle", label: "Lifestyle only" },
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
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="input !py-2 !text-sm !w-auto min-w-[9rem]"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort transactions"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
          <button type="button" className="btn-secondary !text-sm !py-2" onClick={onExport}>
            Export CSV
          </button>
        </div>
      </div>
      <p className="text-xs text-dim">
        Showing {resultCount} of {totalCount} transaction{totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}