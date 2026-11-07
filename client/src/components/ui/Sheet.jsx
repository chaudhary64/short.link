import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

/**
 * Right-hand drawer for creating things. Keeps focus inside while open,
 * closes on Escape / backdrop click, and restores focus on exit.
 */
const Sheet = ({ open, onClose, title, description, footer, children }) => {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    const first = focusable()[0];
    (first ?? panel)?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (restoreRef.current instanceof HTMLElement) {
        restoreRef.current.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="sheet app-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        tabIndex={-1}
      >
        <div className="sheet-head">
          <div style={{ minWidth: 0 }}>
            <h2 className="sheet-title" id="sheet-title">
              {title}
            </h2>
            {description && <p className="sheet-sub">{description}</p>}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close panel"
            style={{ marginLeft: "auto" }}
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>,
    document.body,
  );
};

export default Sheet;
