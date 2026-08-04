import { LuArrowUp } from "react-icons/lu";
import useCountUp from "../../hooks/useCountUp";

const PILL_STYLES = {
  positive: "bg-[#ECFDF5] text-[#047857] border-[#10B981]/25",
  warning: "bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/25",
  neutral: "bg-[#F3F4F6] text-[#6B6B6B] border-[#D4D4D8]",
};

const cardCls =
  "bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

const activeCardCls =
  "relative overflow-hidden bg-[#101012] border border-[rgba(var(--status-active-rgb),0.25)] rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]";

const labelCls =
  "min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]";

const valueCls =
  "text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] leading-none";

const DeltaPill = ({ delta }) => {
  if (!delta) return null;
  const tone = PILL_STYLES[delta.tone] ?? PILL_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap ${tone}`}
    >
      {delta.tone === "positive" && <LuArrowUp className="w-3 h-3" />}
      {delta.text}
    </span>
  );
};

const DashboardStats = ({
  totalLinks,
  totalViews,
  linksDelta,
  viewsDelta,
  activeCount,
  links = [],
}) => {
  const linksValue = useCountUp(totalLinks).toLocaleString();
  const viewsValue = useCountUp(totalViews).toLocaleString();
  const activeValue = useCountUp(activeCount).toLocaleString();

  const latestLink = links.length
    ? [...links].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )[0]
    : null;
  const avgViewsPerLink =
    totalLinks > 0 ? Math.round(totalViews / totalLinks) : 0;
  const disabledCount = Math.max(0, totalLinks - activeCount);
  const activeShare = totalLinks > 0 ? (activeCount / totalLinks) * 100 : 0;

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className={cardCls}>
        <div className="flex items-start justify-between gap-2">
          <span className={labelCls}>Links</span>
          <DeltaPill delta={linksDelta} />
        </div>
        <p className={`${valueCls} mt-2`}>{linksValue}</p>
        {latestLink?.short_code ? (
          <p className="mt-auto text-xs text-[#6B6B6B] truncate">
            Latest:{" "}
            <span className="font-mono font-semibold text-[#0A0A0A]">
              {latestLink.short_code}
            </span>
          </p>
        ) : (
          <p className="mt-auto text-xs text-[#6B6B6B]">{totalLinks} total</p>
        )}
      </div>

      <div className={cardCls}>
        <div className="flex items-start justify-between gap-2">
          <span className={labelCls}>Views</span>
          <DeltaPill delta={viewsDelta} />
        </div>
        <p className={`${valueCls} mt-2`}>{viewsValue}</p>
        <p className="mt-auto text-xs text-[#6B6B6B] truncate">
          ~{avgViewsPerLink.toLocaleString()} per link
        </p>
      </div>

      <div className={activeCardCls}>
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -top-[130px] h-[220px] w-[220px] -translate-x-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(var(--status-active-rgb),0.20), transparent 70%)`,
          }}
        />
        <div className="relative flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A8A93]">
            Active
          </p>
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-[rgb(var(--status-active-rgb))]">
            {Math.round(activeShare)}%
          </span>
        </div>
        <p
          className="relative font-display text-[42px] font-bold leading-none tracking-[-0.03em] text-[rgb(var(--status-active-rgb))] tabular-nums"
          style={{ textShadow: `0 0 24px rgba(var(--status-active-rgb),0.45)` }}
        >
          {activeValue}
        </p>
        <div className="relative mt-auto h-[3px]">
          <div
            className="absolute left-0 right-0 top-[1px] h-px"
            style={{
              background: `linear-gradient(90deg, rgba(var(--status-active-rgb),0.85), rgba(var(--status-active-rgb),0.2) 90%, transparent)`,
            }}
          />
          <div
            className="absolute top-0 h-[3px] w-px bg-[rgb(var(--status-active-rgb))]"
            style={{
              left: `${Math.min(activeShare, 99.8)}%`,
              boxShadow: `0 0 6px rgba(var(--status-active-rgb),0.9)`,
            }}
          />
        </div>
        <div className="relative flex items-center justify-between text-[11px] text-[#6F6F78]">
          <span>
            <b className="font-semibold text-[rgb(var(--status-active-rgb))]">{activeCount}</b> active
          </span>
          {disabledCount > 0 ? (
            <span>
              <b className="font-semibold text-[rgb(var(--status-active-rgb))]">{disabledCount}</b> disabled
            </span>
          ) : (
            <span className="font-medium text-[rgb(var(--status-active-rgb))]">all active</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;
