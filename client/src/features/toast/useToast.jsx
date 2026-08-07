import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContainer } from "../../components/ui/Toast";

const ToastContext = createContext(null);

const genId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toastFn = useCallback(
    ({ variant = "info", title, message, duration = 4000 }) => {
      const id = genId();
      setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
      timers.current[id] = setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const toast = useMemo(
    () => ({
      success: (title, message, opts) =>
        toastFn({ variant: "success", title, message, ...opts }),
      error: (title, message, opts) =>
        toastFn({ variant: "error", title, message, ...opts }),
      warning: (title, message, opts) =>
        toastFn({ variant: "warning", title, message, ...opts }),
      info: (title, message, opts) =>
        toastFn({ variant: "info", title, message, ...opts }),
    }),
    [toastFn],
  );

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

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
};
