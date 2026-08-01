import { useEffect, useRef } from "react";

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
    wrapper: "bg-white border border-[#E5E5EA] border-l-2 border-l-[#10B981]",
    icon: "text-[#10B981] bg-[#10B981]/10",
    title: "text-[#0A0A0A]",
    message: "text-[#6B6B6B]",
    progress: "bg-[#10B981]",
    close: "text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]",
  },
  error: {
    wrapper: "bg-white border border-[#E5E5EA] border-l-2 border-l-[#EF4444]",
    icon: "text-[#EF4444] bg-[#EF4444]/10",
    title: "text-[#0A0A0A]",
    message: "text-[#6B6B6B]",
    progress: "bg-[#EF4444]",
    close: "text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]",
  },
  warning: {
    wrapper: "bg-white border border-[#E5E5EA] border-l-2 border-l-[#F59E0B]",
    icon: "text-[#F59E0B] bg-[#F59E0B]/10",
    title: "text-[#0A0A0A]",
    message: "text-[#6B6B6B]",
    progress: "bg-[#F59E0B]",
    close: "text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]",
  },
  info: {
    wrapper: "bg-white border border-[#E5E5EA] border-l-2 border-l-[#6366F1]",
    icon: "text-[#6366F1] bg-[#6366F1]/10",
    title: "text-[#0A0A0A]",
    message: "text-[#6B6B6B]",
    progress: "bg-[#6366F1]",
    close: "text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]",
  },
};

export const ToastItem = ({ toast, onRemove }) => {
  const { id, variant = "info", title, message, duration = 4000 } = toast;
  const cls = variantClasses[variant] ?? variantClasses.info;
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
      style={{ animation: "toast-in 0.2s ease-out forwards" }}
      className={`relative flex items-start gap-3 w-full sm:w-80 shadow-md overflow-hidden pointer-events-auto rounded-lg ${cls.wrapper}`}
    >
      <div className={`mt-3.5 ml-3.5 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${cls.icon}`}>
        {icons[variant]}
      </div>

      <div className="flex-1 py-3 pr-2 min-w-0">
        {title && (
          <p className={`text-sm font-semibold leading-tight mb-0.5 ${cls.title}`}>{title}</p>
        )}
        {message && (
          <p className={`text-xs leading-relaxed ${cls.message}`}>{message}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        className={`mt-3 mr-2.5 shrink-0 p-1.5 rounded-md transition-colors duration-150 cursor-pointer ${cls.close}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        ref={progressRef}
        style={{ width: "100%" }}
        className={`absolute bottom-0 left-0 h-[2px] ${cls.progress}`}
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
      className="
        fixed z-[9999] flex flex-col gap-2 pointer-events-none
        top-[4.5rem] left-3 right-3
        sm:left-auto sm:right-5 sm:w-80
      "
    >
      {hiddenCount > 0 && (
        <div className="text-center pointer-events-auto">
          <span className="inline-block px-3 py-1 bg-[#0A0A0A]/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
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
