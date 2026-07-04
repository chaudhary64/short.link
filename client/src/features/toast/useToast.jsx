import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ToastContainer } from "../../components/ui/Toast";



const ToastContext = createContext(null);



export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);


  const toast = useCallback(({ variant = "info", title, message, duration = 4000 }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);


  toast.success = (title, message, opts) => toast({ variant: "success", title, message, ...opts });
  toast.error   = (title, message, opts) => toast({ variant: "error",   title, message, ...opts });
  toast.warning = (title, message, opts) => toast({ variant: "warning", title, message, ...opts });
  toast.info    = (title, message, opts) => toast({ variant: "info",    title, message, ...opts });


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




export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
};
