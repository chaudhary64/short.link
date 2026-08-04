import { LuLink } from "react-icons/lu";

const DashboardEmptyState = () => {
  return (
    <div className="relative rounded-2xl border border-[#E4E4E9] bg-white/70 flex flex-col items-center text-center px-6 py-20">
      <LuLink className="w-10 h-10 text-[#C1C1C9] mb-5" strokeWidth={1.5} />

      <h2 className="text-xl font-display font-medium tracking-[-0.02em] text-[#0A0A0A]">
        No links yet
      </h2>

      <p className="mt-2 text-sm text-[#8A8A93] max-w-xs leading-relaxed">
        Your first short link will appear here.
      </p>
    </div>
  );
};

export default DashboardEmptyState;
