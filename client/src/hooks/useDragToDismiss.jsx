import { useEffect, useRef, useState } from "react";

export const useDragToDismiss = ({ open, onClose, threshold = 90 }) => {
  const [dragY, setDragY] = useState(0);
  const [closing, setClosing] = useState(false);
  const ref = useRef(null);

  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startY = null;
    let dragging = false;
    let latestDy = 0;
    let timer = null;

    const onStart = (e) => {
      if (e.touches.length !== 1 || closingRef.current) return;
      const scroller = el.querySelector("[data-sheet-scroll]");
      if (scroller && scroller.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dragging = true;
      latestDy = 0;
    };

    const onMove = (e) => {
      if (!dragging || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        latestDy = dy;
        setDragY(dy);
        if (e.cancelable) e.preventDefault();
      }
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      if (latestDy > threshold) {
        closingRef.current = true;
        setClosing(true);
        timer = setTimeout(() => {
          onCloseRef.current();
          closingRef.current = false;
          setClosing(false);
          setDragY(0);
        }, 200);
      } else {
        setDragY(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      if (timer) clearTimeout(timer);
    };
  }, [open, threshold]);

  return {
    ref,
    style: {
      transform: closing ? "translateY(110%)" : `translateY(${dragY}px)`,
      transition:
        dragY > 0 && !closing
          ? "none"
          : "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
      touchAction: "pan-y",
    },
  };
};

export default useDragToDismiss;
