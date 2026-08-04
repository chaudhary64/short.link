import { useId, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { LuChevronDown, LuSearch, LuX } from "react-icons/lu";
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
const TICK = { fontSize: 10, fill: "#71717A" };

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
        <span className="text-[#71717A]">{unitLabel}</span>
      </div>
    </div>
  );
};

export function BarChart({ data, color = ACCENT, height = 160, unit = "clicks", showAxis = false }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-xs text-[#71717A]">No data in this period</p>
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
          {showAxis ? (
            <YAxis
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={34}
            />
          ) : (
            <YAxis hide />
          )}
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
        <span className="text-[11px] text-[#71717A] tabular-nums shrink-0">
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

const BreakdownDonut = ({ items, sum, hovered, setHovered }) => {
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const radius = rect.width / 2;
    if (!items.length || dist < radius * 0.64 || dist > radius * 0.86) {
      setHovered((prev) => (prev === null ? prev : null));
      return;
    }
    const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 450) % 360;
    const next = Math.min(items.length - 1, Math.floor((deg / 360) * items.length));
    setHovered((prev) => (prev === next ? prev : next));
  };

  return (
    <div
      className="relative w-32 h-32 shrink-0"
      onMouseMove={handleMove}
      onMouseLeave={() => setHovered(null)}
    >
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
              isAnimationActive={false}
            >
              {items.map((it) => (
                <Cell
                  key={it.id}
                  fill={it.color}
                  fillOpacity={hovered === null || hovered === it.id ? 1 : 0.4}
                  style={{ transition: "fill-opacity 0.15s ease" }}
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
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
            Total
          </span>
          <span className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
            {sum.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

function BreakdownModal({ open, onClose, title, icon, items, sum, max, iconFor }) {
  const [hovered, setHovered] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("clicks");
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef(null);
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({ open, onClose });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = setTimeout(() => onCloseRef.current(), 200);
  }, []);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = sheetRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    dialog.focus({ preventScroll: true });

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, sheetRef]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map((it, i) => ({ ...it, _idx: i }))
      .filter((it) => !q || it.label.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "clicks" ? b.value - a.value : a.label.localeCompare(b.label)
      );
  }, [items, query, sort]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} breakdown`}
        tabIndex={-1}
        className="relative w-full sm:max-w-xl bg-white border border-[#D4D4D8] sm:shadow-2xl rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh] outline-none"
        style={{
          animation: closing
            ? "none"
            : "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          ...sheetDragStyle,
          ...(closing
            ? {
                transform: "translateY(110%)",
                transition: "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }
            : {}),
        }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>

        <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 bg-[#F3F4F6] text-[#0A0A0A] flex items-center justify-center rounded-lg shrink-0">
              {icon}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#0A0A0A] truncate">{title}</h3>
              <p className="text-xs text-[#71717A] mt-0.5 truncate">
                {items.length} {items.length === 1 ? "category" : "categories"} ·{" "}
                {sum.toLocaleString()} total clicks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20"
            aria-label="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        
        <div className="px-5 py-3 border-b border-[#E5E5EA] flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex-1 min-w-[160px]">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="w-full h-8 pl-8 pr-3 rounded-md border border-[#E8E8EC] bg-white text-xs text-[#0A0A0A] placeholder:text-[#71717A] outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 transition-all"
            />
          </div>
          <div
            className="flex items-center rounded-md border border-[#E8E8EC] bg-[#FAFAFA] p-0.5 shrink-0"
            role="group"
            aria-label="Sort breakdown"
          >
            <button
              type="button"
              onClick={() => setSort("clicks")}
              aria-pressed={sort === "clicks"}
              className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 ${
                sort === "clicks"
                  ? "bg-white text-[#0A0A0A] shadow-sm border border-[#D4D4D8]"
                  : "text-[#6B6B6B] hover:text-[#0A0A0A]"
              }`}
            >
              Clicks
            </button>
            <button
              type="button"
              onClick={() => setSort("alpha")}
              aria-pressed={sort === "alpha"}
              className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 ${
                sort === "alpha"
                  ? "bg-white text-[#0A0A0A] shadow-sm border border-[#D4D4D8]"
                  : "text-[#6B6B6B] hover:text-[#0A0A0A]"
              }`}
            >
              A–Z
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5" data-sheet-scroll>
          <div className="flex flex-col items-center gap-5">
            <BreakdownDonut items={items} sum={sum} hovered={hovered} setHovered={setHovered} />

            <div className="w-full rounded-lg border border-[#E8E8EC] overflow-hidden">
              <div className="grid grid-cols-[28px_1fr_64px_110px] sm:grid-cols-[32px_1fr_72px_150px] gap-1.5 sm:gap-2 items-center px-4 py-2 bg-[#FAFAFA] border-b border-[#E8E8EC] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                <span>#</span>
                <span>Category</span>
                <span className="text-right">Clicks</span>
                <span>Share</span>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {rows.map((row, i) => {
                  const pct = sum > 0 ? Math.round((row.value / sum) * 100) : 0;
                  const isActive = hovered === row._idx;
                  return (
                    <div
                      key={row.id}
                      onMouseEnter={() => setHovered(row._idx)}
                      onMouseLeave={() => setHovered(null)}
                      className={`grid grid-cols-[28px_1fr_64px_110px] sm:grid-cols-[32px_1fr_72px_150px] gap-1.5 sm:gap-2 items-center px-4 py-2 transition-colors duration-150 cursor-pointer ${
                        isActive ? "bg-[#F6F6F9]" : "hover:bg-[#F6F6F9]"
                      }`}
                    >
                      <span className="text-[11px] text-[#71717A] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-[#F3F4F6] border border-[#D4D4D8] flex items-center justify-center text-[#0A0A0A] shrink-0">
                          {iconFor
                            ? iconFor(row.label)
                            : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />}
                        </span>
                        <span className="text-xs text-[#0A0A0A] truncate capitalize">{row.label}</span>
                      </span>
                      <span className="text-right text-xs font-medium text-[#0A0A0A] tabular-nums">
                        {row.value.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.value / max) * 100}%` }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] tabular-nums w-9 text-right shrink-0">
                          {pct}%
                        </span>
                      </span>
                    </div>
                  );
                })}
                {rows.length === 0 && (
                  <p className="text-xs text-[#71717A] text-center py-6">
                    {items.length === 0 ? "No data yet" : "No categories match your search"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DonutBreakdown({ data, iconFor, title = "Breakdown", icon, collapseAfter = 3, palette }) {
  const [hovered, setHovered] = useState(null);
  const [open, setOpen] = useState(false);

  const val = (d) => d.value ?? d.clicks ?? 0;
  const sum = data.reduce((acc, d) => acc + val(d), 0);

  const defaultPalette = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#6366F1"];
  const colors = palette || defaultPalette;

  const items = data.map((d, i) => ({
    id: i,
    label: d.label,
    value: val(d),
    color: colors[i % colors.length],
  }));
  const max = Math.max(...items.map((it) => it.value), 1);
  const visible = items.slice(0, collapseAfter);

  return (
    <>
      <div className="flex items-center gap-5">
        <BreakdownDonut items={items} sum={sum} hovered={hovered} setHovered={setHovered} />

        
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
            <p className="text-xs text-[#71717A] text-center py-2">No data yet</p>
          )}
          {items.length > collapseAfter && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center gap-1 mt-0.5 text-[11px] font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors duration-150 cursor-pointer py-0.5 focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
            >
              View full breakdown · {items.length - collapseAfter} more
              <LuChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      
      {open && (
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
      )}
    </>
  );
}

export function Sparkline({ data, color = ACCENT, height = 32 }) {
  const gradientId = useId().replace(/[:]/g, "");

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-[10px] text-[#71717A]">No data</span>
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

