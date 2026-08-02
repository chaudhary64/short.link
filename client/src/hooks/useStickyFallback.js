import { useEffect, useState } from "react";

const useStickyFallback = (ref, topInset = 56) => {
  const [stuck, setStuck] = useState(false);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setStuck(el.getBoundingClientRect().top <= topInset);
      const parent = el.parentElement;
      setFloating(
        !!parent &&
          parent.getBoundingClientRect().bottom <= topInset + el.offsetHeight,
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, topInset]);

  return { stuck, floating };
};

export default useStickyFallback;
