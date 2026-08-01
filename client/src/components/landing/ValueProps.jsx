import { motion } from "motion/react";
import { LuChartNoAxesColumn, LuInfinity, LuZap } from "react-icons/lu";

const props = [
  {
    title: "Free forever",
    description: "No plans, no paywalls, and no limits on the links you create.",
    icon: <LuInfinity className="w-5 h-5" />,
  },
  {
    title: "Instant redirects",
    description: "Every click resolves from a Redis-backed cache in milliseconds.",
    icon: <LuZap className="w-5 h-5" />,
  },
  {
    title: "Analytics built in",
    description: "Clicks, unique visitors, countries, and devices on every link.",
    icon: <LuChartNoAxesColumn className="w-5 h-5" />,
  },
];

const ValueProps = () => {
  return (
    <section className="mx-auto px-6 py-10 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {props.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              delay: index * 0.08,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="bg-white border border-[#E8E8EC] rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="w-11 h-11 bg-gray-50 border border-[#E8E8EC] rounded-lg flex items-center justify-center text-[#0A0A0A]">
              {item.icon}
            </div>
            <h3 className="text-base font-semibold text-[#0A0A0A] mt-4">
              {item.title}
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ValueProps;
