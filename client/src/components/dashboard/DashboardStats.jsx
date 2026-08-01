import StatCard from "../ui/StatCard";
import { LuCheck, LuEye, LuLink } from "react-icons/lu";

const DashboardStats = ({
  totalLinks,
  totalViews,
  linksDelta,
  viewsDelta,
  activeCount,
  activeDescription,
}) => {
  const stats = [
    {
      title: "Total Links",
      value: totalLinks.toString(),
      description: linksDelta,
      icon: <LuLink className="w-5 h-5" />,
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      description: viewsDelta,
      icon: <LuEye className="w-5 h-5" />,
    },
    {
      title: "Active Links",
      value: activeCount.toString(),
      description: activeDescription,
      icon: <LuCheck className="w-5 h-5" />,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat, i) => (
        <StatCard
          key={i}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </section>
  );
};

export default DashboardStats;
