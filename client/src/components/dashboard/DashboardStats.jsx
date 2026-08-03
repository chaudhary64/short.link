import StatCard from "../ui/StatCard";
import { LuCheck, LuEye, LuLink } from "react-icons/lu";
import useCountUp from "../../hooks/useCountUp";

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
      titleClassName: "text-[#0A0A0A]",
    },
    {
      title: "Views",
      value: viewsValue,
      description: viewsDelta,
      icon: <LuEye className="w-5 h-5" />,
      titleClassName: "text-[#0A0A0A]",
    },
    {
      title: "Active",
      value: activeValue,
      description: activeDescription,
      icon: <LuCheck className="w-5 h-5" />,
      titleClassName: "text-[#0A0A0A]",
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
