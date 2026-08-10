import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { LuX } from "react-icons/lu";

const ModalSheet = ({
  open,
  onClose,
  ariaLabel,
  role = "dialog",
  header,
  footer,
  children,
  showClose = true,
}) => {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef(null);
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({
    open,
    onClose,
  });

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onCloseRef.current();
      closingRef.current = false;
      setClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = sheetRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    if (previouslyFocused === document.body) {
      dialog.focus({ preventScroll: true });
    }

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, sheetRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-[rgba(20,20,20,0.55)]"
        onClick={close}
      />
      <div
        ref={sheetRef}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="relative w-full sm:max-w-[400px] bg-[#f5f3ee] border-2 border-[#141414] sm:shadow-[8px_8px_0_#141414] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh] outline-none"
        style={{
          animation: closing
            ? "none"
            : "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          ...sheetDragStyle,
          ...(closing
            ? {
                transform: "translateY(110%)",
                transition: "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }
            : {}),
        }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>

        {header && (
          <div className="px-5 py-4 border-b-2 border-[#141414] flex items-center justify-between gap-3 shrink-0">
            <div className="min-w-0 flex-1">{header}</div>
            {showClose && (
              <button
                type="button"
                onClick={close}
                className="g-modal-close static shrink-0"
                aria-label="Close"
              >
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto overscroll-contain p-5 flex flex-col gap-4"
          data-sheet-scroll
        >
          {children}
        </div>

        {footer && (
          <div className="g-modal-actions px-5 py-4 border-t-2 border-[#141414] shrink-0 [&>*]:flex-1">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ModalSheet;
