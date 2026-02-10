"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 30_000;

/**
 * Phase J: Poll every 30s for realtime KPI updates.
 * Call onRefresh when the interval fires.
 */
export function useFinancePolling(onRefresh: () => void, enabled = true) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      onRefreshRef.current();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);
}
