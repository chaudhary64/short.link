const raw = Number(import.meta.env.VITE_POLL_INTERVAL_MS);
export const POLL_INTERVAL_MS = Number.isFinite(raw) && raw > 0 ? raw : 30_000;

export const REFETCH_ON_WINDOW_FOCUS = true;
