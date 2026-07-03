import { useEffect, useRef } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────────

const icons = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const variantClasses = {
  success: {
    wrapper: "bg-white border border-gray-200 border-l-2 border-l-emerald-500",
    icon: "text-emerald-600 bg-emerald-50",
    title: "text-gray-900",
    message: "text-gray-500",
    progress: "bg-emerald-500",
    close: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
  error: {
    wrapper: "bg-white border border-gray-200 border-l-2 border-l-red-500",
    icon: "text-red-600 bg-red-50",
    title: "text-gray-900",
    message: "text-gray-500",
    progress: "bg-red-500",
    close: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
  warning: {
    wrapper: "bg-white border border-gray-200 border-l-2 border-l-amber-500",
    icon: "text-amber-600 bg-amber-50",
    title: "text-gray-900",
    message: "text-gray-500",
    progress: "bg-amber-500",
    close: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
  info: {
    wrapper: "bg-white border border-gray-200 border-l-2 border-l-blue-500",
    icon: "text-blue-600 bg-blue-50",
    title: "text-gray-900",
    message: "text-gray-500",
    progress: "bg-blue-500",
    close: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
};

// ── Single Toast Item ──────────────────────────────────────────────────────────

export const ToastItem = ({ toast, onRemove }) => {
  const { id, variant = "info", title, message, duration = 4000 } = toast;
  const cls = variantClasses[variant] ?? variantClasses.info;
  const progressRef = useRef(null);

  // Animate the progress bar from 100% → 0% over `duration` ms
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.getBoundingClientRect(); // force reflow
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = "0%";
  }, [duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{ animation: "toast-in 0.2s ease-out forwards" }}
      className={`relative flex items-start gap-3 w-full sm:w-80 shadow-md overflow-hidden ${cls.wrapper}`}
    >
      {/* Coloured icon badge */}
      <div className={`mt-4 ml-3 flex items-center justify-center w-7 h-7 shrink-0 ${cls.icon}`}>
        {icons[variant]}
      </div>

      {/* Text */}
      <div className="flex-1 py-3 pr-2 min-w-0">
        {title && (
          <p className={`text-sm font-semibold leading-tight mb-0.5 ${cls.title}`}>{title}</p>
        )}
        {message && (
          <p className={`text-xs leading-relaxed ${cls.message}`}>{message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        className={`mt-2.5 mr-2.5 shrink-0 p-1 transition-colors duration-150 cursor-pointer ${cls.close}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar — slides from full width to 0 */}
      <div
        ref={progressRef}
        style={{ width: "100%" }}
        className={`absolute bottom-0 left-0 h-[2px] ${cls.progress}`}
      />
    </div>
  );
};

// ── Toast Container ────────────────────────────────────────────────────────────

export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    <div
      aria-label="Notifications"
      className="
        fixed z-[9999] flex flex-col gap-2
        bottom-3 left-3 right-3
        sm:bottom-5 sm:left-auto sm:right-5 sm:w-80
      "
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};
