import { useId, useState, useEffect } from "react";
import { motion } from "motion/react";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { LuChevronDown, LuX } from "react-icons/lu";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACCENT = "#6366F1";
const GRID = "#D4D4D8";
const TICK = { fontSize: 10, fill: "#9C9C9C" };

// Shared tooltip styled to match the app (dark pill, formatted count).
const ChartTooltip = ({ active, payload, label, unit = "clicks" }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const heading = p.payload?.color ? p.name : label;
  const value = Number(p.value ?? 0);
  const unitLabel = value === 1 ? unit.replace(/s$/, "") : unit;

  return (
    <div className="rounded-md bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white shadow-lg">
      {heading != null && heading !== "" && (
        <div className="mb-0.5 text-[11px] text-[#C1C1C9] capitalize">{heading}</div>
      )}
      <div className="flex items-center gap-1.5">
        {p.payload?.color && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.payload.color }}
          />
        )}
        <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
        <span className="text-[#9C9C9C]">{unitLabel}</span>
      </div>
    </div>
  );
};

// Discrete bar chart for traffic — the honest representation for sparse or
// low-volume data. A spline line (type="natural") overshoots between zero-gap
// days, drawing a misleading dip before a spike; bars never imply movement
// between buckets, so zeros read as zeros and a spike reads as a spike.
export function BarChart({ data, color = ACCENT, height = 160, unit = "clicks" }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-xs text-[#9C9C9C]">No data in this period</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 4, bottom: 8, left: 4 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={TICK}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickMargin={6}
          />
          <YAxis hide />
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ fill: "rgba(99,102,241,0.08)" }}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
            activeBar={{ fill: "#4F46E5" }}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// One ranked row in a breakdown list — icon tile, label, value + share %, and
// an animated share bar. Shared by the compact card and the "Show all" modal.
const BreakdownRow = ({ it, pct, isActive, onEnter, onLeave, iconFor, max }) => (
  <div
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    className={`flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors duration-150 cursor-pointer ${
      isActive ? "bg-[#F6F6F9]" : ""
    }`}
  >
    <span className="w-6 h-6 rounded-md bg-[#F3F4F6] border border-[#D4D4D8] flex items-center justify-center text-[#0A0A0A] shrink-0">
      {iconFor
        ? iconFor(it.label)
        : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#6B6B6B] truncate capitalize">{it.label}</span>
        <span className="text-[11px] text-[#9C9C9C] tabular-nums shrink-0">
          <span className="font-medium text-[#0A0A0A]">{it.value.toLocaleString()}</span>
          <span className="ml-1">· {pct}%</span>
        </span>
      </div>
      <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden mt-1">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(it.value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: it.color }}
        />
      </div>
    </div>
  </div>
);

// Donut with the total in its center, hover-synced with the adjacent list.
const BreakdownDonut = ({ items, sum, hovered, setHovered }) => (
  <div className="relative w-32 h-32 shrink-0">
    {items.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
          <Pie
            data={items}
            dataKey="value"
            nameKey="label"
            innerRadius="64%"
            outerRadius="86%"
            cornerRadius={3}
            paddingAngle={1.5}
            stroke="none"
            onMouseEnter={(_, i) => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {items.map((it) => (
              <Cell
                key={it.id}
                fill={it.color}
                fillOpacity={hovered === null || hovered === it.id ? 1 : 0.4}
                style={{ transition: "fill-opacity 0.2s ease", cursor: "pointer" }}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    ) : (
      <div className="w-full h-full rounded-full border-[9px] border-[#E5E5EA]" />
    )}
    {items.length > 0 && (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
          Total
        </span>
        <span className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
          {sum.toLocaleString()}
        </span>
      </div>
    )}
  </div>
);

// Full ranked breakdown in a bottom sheet (mobile) / centered dialog (desktop).
// Dismiss via grabber swipe, backdrop tap, Escape, or the close button.
function BreakdownModal({ open, onClose, title, icon, items, sum, max, iconFor }) {
  const [hovered, setHovered] = useState(null);
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({ open, onClose });

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} breakdown`}
        className="relative w-full sm:max-w-md bg-white border border-[#D4D4D8] sm:shadow-2xl rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh]"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)", ...sheetDragStyle }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>

        <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-[#F3F4F6] text-[#0A0A0A] flex items-center justify-center rounded-lg shrink-0">
              {icon}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A]">{title}</h3>
              <p className="text-xs text-[#9C9C9C] mt-0.5">
                {items.length} {items.length === 1 ? "category" : "categories"} ·{" "}
                {sum.toLocaleString()} total clicks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5" data-sheet-scroll>
          <div className="flex items-center gap-5">
            <BreakdownDonut items={items} sum={sum} hovered={hovered} setHovered={setHovered} />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {items.map((it, i) => {
                const pct = sum > 0 ? Math.round((it.value / sum) * 100) : 0;
                const isActive = hovered === i;
                return (
                  <BreakdownRow
                    key={it.id}
                    it={it}
                    pct={pct}
                    isActive={isActive}
                    onEnter={() => setHovered(i)}
                    onLeave={() => setHovered(null)}
                    iconFor={iconFor}
                    max={max}
                  />
                );
              })}
              {items.length === 0 && (
                <p className="text-xs text-[#9C9C9C] text-center py-2">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact donut + ranked breakdown list with animated share bars. The donut
// shows the total in its center; the list rows carry an icon, value, and share
// %, and highlight in sync with the hovered slice. Any list longer than
// `collapseAfter` entries shows the top rows and opens the full breakdown in a
// modal via "Show all" — keeping the card compact and the page stable.
export function DonutBreakdown({ data, iconFor, title = "Breakdown", icon, collapseAfter = 3 }) {
  const [hovered, setHovered] = useState(null);
  const [open, setOpen] = useState(false);

  const val = (d) => d.value ?? d.clicks ?? 0;
  const sum = data.reduce((acc, d) => acc + val(d), 0);

  const palette = ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF", "#4F46E5"];

  const items = data.map((d, i) => ({
    id: i,
    label: d.label,
    value: val(d),
    color: palette[i % palette.length],
  }));
  const max = Math.max(...items.map((it) => it.value), 1);
  const visible = items.slice(0, collapseAfter);

  return (
    <>
      <div className="flex items-center gap-5">
        <BreakdownDonut items={items} sum={sum} hovered={hovered} setHovered={setHovered} />

        {/* Ranked list — top `collapseAfter` rows, the rest open in a modal */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {visible.map((it, i) => {
            const pct = sum > 0 ? Math.round((it.value / sum) * 100) : 0;
            const isActive = hovered === i;
            return (
              <BreakdownRow
                key={it.id}
                it={it}
                pct={pct}
                isActive={isActive}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(null)}
                iconFor={iconFor}
                max={max}
              />
            );
          })}
          {items.length === 0 && (
            <p className="text-xs text-[#9C9C9C] text-center py-2">No data yet</p>
          )}
          {items.length > collapseAfter && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center gap-1 mt-0.5 text-[11px] font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors duration-150 cursor-pointer py-0.5"
            >
              Show all · {items.length - collapseAfter} more
              <LuChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <BreakdownModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        icon={icon}
        items={items}
        sum={sum}
        max={max}
        iconFor={iconFor}
      />
    </>
  );
}

// Tiny axis-less area chart for KPI cards — a quiet sparkline that shows the
// shape of a metric without axes, grid, or tooltip.
export function Sparkline({ data, color = ACCENT, height = 32 }) {
  const gradientId = useId().replace(/[:]/g, "");

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-[10px] text-[#9C9C9C]">No data</span>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

