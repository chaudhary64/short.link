import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ToastContainer } from "../../components/ui/Toast";

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  /**
   * Show a toast notification.
   * @param {Object} options
   * @param {"success"|"error"|"warning"|"info"} options.variant
   * @param {string}  options.title    – bold heading (optional)
   * @param {string}  options.message  – body text   (optional)
   * @param {number}  options.duration – ms before auto-dismiss (default 4000)
   */
  const toast = useCallback(({ variant = "info", title, message, duration = 4000 }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  // Convenience shorthands
  toast.success = (title, message, opts) => toast({ variant: "success", title, message, ...opts });
  toast.error   = (title, message, opts) => toast({ variant: "error",   title, message, ...opts });
  toast.warning = (title, message, opts) => toast({ variant: "warning", title, message, ...opts });
  toast.info    = (title, message, opts) => toast({ variant: "info",    title, message, ...opts });

  // Cleanup on unmount
  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns a `toast` function to fire notifications from anywhere in the app.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Saved!", "Your changes have been saved.");
 *   toast.error("Error", "Something went wrong.");
 *   toast({ variant: "info", title: "FYI", message: "...", duration: 6000 });
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
};
