import { useEffect, useRef } from "react";

/**
 * Accessible popover menu: closes on outside click / Escape / navigation,
 * supports arrow-key roving focus between [role="menuitem"] children.
 */
const Menu = ({ open, onClose, children, labelledBy, minWidth = 232 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        ref.current?.querySelectorAll('[role="menuitem"], [role="menuitemradio"]') ??
          [],
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!items.length) return;
      event.preventDefault();
      const index = items.indexOf(document.activeElement);
      const next =
        event.key === "ArrowDown"
          ? items[(index + 1) % items.length]
          : items[(index - 1 + items.length) % items.length];
      next.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const first = ref.current?.querySelector(
      '[role="menuitem"], [role="menuitemradio"]',
    );
    first?.focus({ preventScroll: true });
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-labelledby={labelledBy}
      className="menu"
      style={{ minWidth, top: "calc(100% + 6px)", right: 0, left: "auto" }}
    >
      {children}
    </div>
  );
};

export default Menu;
