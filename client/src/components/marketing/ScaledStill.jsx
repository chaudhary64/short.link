import { useEffect, useRef, useState } from "react";

/**
 * A still drawn at a fixed design size and scaled to whatever width it lands
 * in.
 *
 * The stills on this page are miniature product screens: they are authored at
 * one size (the size their type was set for) and scaled, the way a product
 * shot scales, instead of re-flowing into a layout the product would never
 * render. `children` is laid out in design pixels; the wrapper owns the
 * scaling, the crop and the mat.
 */
const ScaledStill = ({ width, height, className = "", children }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = el.clientWidth / width;
      if (next > 0) setScale(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`m-still ${className}`.trim()}
      style={{ "--m-still-scale": scale }}
    >
      <div
        className="m-still-fit"
        style={{ width, height }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaledStill;
