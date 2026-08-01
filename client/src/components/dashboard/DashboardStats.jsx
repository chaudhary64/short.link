import { useEffect, useState } from "react";
import StatCard from "../ui/StatCard";
import { LuCheck, LuEye, LuLink } from "react-icons/lu";

const useCountUp = (target) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      const raf = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(raf);
    }

    const duration = 800;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
};

const DashboardStats = ({
  totalLinks,
  totalViews,
  linksDelta,
  viewsDelta,
  activeCount,
  activeDescription,
}) => {
  const linksValue = useCountUp(totalLinks).toLocaleString();
  const viewsValue = useCountUp(totalViews).toLocaleString();
  const activeValue = useCountUp(activeCount).toLocaleString();

  const stats = [
    {
      title: "Links",
      value: linksValue,
      description: linksDelta,
      icon: <LuLink className="w-5 h-5" />,
    },
    {
      title: "Views",
      value: viewsValue,
      description: viewsDelta,
      icon: <LuEye className="w-5 h-5" />,
    },
    {
      title: "Active",
      value: activeValue,
      description: activeDescription,
      icon: <LuCheck className="w-5 h-5" />,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  );
};

export default DashboardStats;
