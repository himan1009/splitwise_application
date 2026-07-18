import { useEffect, useState } from "react";

export const DEFAULT_SLOW_MESSAGE =
  "Still loading… Free database servers can take up to a minute to wake up. Please wait — your data is on the way.";

export function useSlowLoadHint(active, delayMs = 2500) {
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    if (!active) {
      setShowSlowHint(false);
      return undefined;
    }

    const timer = setTimeout(() => setShowSlowHint(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return showSlowHint;
}
