import { useEffect, useRef } from "react";

const variantClasses = {
  success: "g-toast-success",
  error: "",
  warning: "g-toast-warning",
  info: "g-toast-info",
};

export const ToastItem = ({ toast, onRemove }) => {
  const { id, variant = "info", title, message, duration = 4000 } = toast;
  const variantCls = variantClasses[variant] ?? variantClasses.info;
  const progressRef = useRef(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.getBoundingClientRect();
    const raf = requestAnimationFrame(() => {
      el.style.transition = `width ${duration}ms linear`;
      el.style.width = "0%";
    });
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`g-toast relative ${variantCls}`}
    >
      <div className="pr-4">
        {title && <p className="g-toast-title">{title}</p>}
        {message && <p className="g-toast-body">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        className="g-toast-close"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        ref={progressRef}
        style={{ width: "100%" }}
        className={`g-toast-progress ${variantCls}`}
      />
    </div>
  );
};

const MAX_VISIBLE = 4;

export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  const visible = toasts.slice(-MAX_VISIBLE);
  const hiddenCount = toasts.length - visible.length;

  return (
    <div
      aria-label="Notifications"
      aria-live="polite"
      className="g-toast-region"
    >
      {hiddenCount > 0 && (
        <div className="text-center pointer-events-none">
          <span className="inline-block px-3 py-1 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-[0.12em]">
            +{hiddenCount} more notification{hiddenCount > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {visible.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};
