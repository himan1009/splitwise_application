import { useSlowLoadHint, DEFAULT_SLOW_MESSAGE } from "../../hooks/useSlowLoadHint";

export default function PageLoader({
  message = "Loading...",
  slowMessage = DEFAULT_SLOW_MESSAGE,
}) {
  const showSlowHint = useSlowLoadHint(true);

  return (
    <div className="page-container">
      <div className="page-loader card">
        <div className="page-loader-spinner" aria-hidden="true" />
        <p className="text-sm text-muted font-medium">{message}</p>
        {showSlowHint && (
          <div className="slow-load-hint slow-load-hint-page" role="status" aria-live="polite">
            <div className="slow-load-hint-icon" aria-hidden>
              <span className="slow-load-hint-pulse" />
              <span>⏳</span>
            </div>
            <div className="min-w-0 text-left sm:text-center">
              <p className="slow-load-hint-title">Waking up the server</p>
              <p className="slow-load-hint-text">{slowMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
