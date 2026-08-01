import { useId, useState } from "react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart as RechartsAreaChart,
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
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const heading = p.payload?.color ? p.name : label;

  return (
    <div className="rounded-md bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white shadow-lg">
      {heading != null && heading !== "" && (
        <div className="mb-0.5 text-[11px] text-gray-300 capitalize">{heading}</div>
      )}
      <div className="flex items-center gap-1.5">
        {p.payload?.color && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.payload.color }}
          />
        )}
        <span className="font-semibold tabular-nums">
          {(p.value ?? 0).toLocaleString()}
        </span>
        <span className="text-gray-400">clicks</span>
      </div>
    </div>
  );
};

export function AreaChart({ data, color = ACCENT, height = 160 }) {
  const gradientId = useId().replace(/[:]/g, "");

  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-xs text-gray-400">No data in this period</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 4, bottom: 8, left: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
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
            content={<ChartTooltip />}
            cursor={{ stroke: "#D4D4D8", strokeDasharray: "3 3" }}
          />
          <Area
            type="natural"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null);

  // Support both { label, value } and { label, clicks } payloads
  const val = (d) => d.value ?? d.clicks ?? 0;
  const sum = data.reduce((acc, d) => acc + val(d), 0);

  const palette = ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF", "#4F46E5"];

  const items = data.map((d, i) => ({
    id: i,
    label: d.label,
    value: val(d),
    color: palette[i % palette.length],
  }));

  // Hovered slice, rendered in a fixed slot ABOVE the donut so the tooltip
  // never overlaps the chart (Recharts' cursor-following tooltip does).
  const active = hovered != null ? items[hovered] : null;
  const activePct = active ? (sum > 0 ? Math.round((active.value / sum) * 100) : 0) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Tooltip slot — fixed height, outside the donut */}
      {items.length > 0 && (
        <div className="flex h-8 w-full items-center justify-center">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 rounded-md bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white shadow-lg"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: active.color }}
              />
              <span className="font-medium text-gray-300 capitalize">{active.label}</span>
              <span className="font-semibold tabular-nums">
                {active.value.toLocaleString()}
                <span className="text-gray-400 font-normal"> · {activePct}%</span>
              </span>
            </motion.div>
          ) : (
            <span className="text-[11px] text-[#9C9C9C]">Hover a slice for details</span>
          )}
        </div>
      )}

      <div className="relative w-44 h-44 md:w-32 md:h-32">
        {items.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Pie
                data={items}
                dataKey="value"
                nameKey="label"
                innerRadius="63%"
                outerRadius="85%"
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
        {/* Center always shows the total across all slices */}
        {items.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
              Total
            </span>
            <span className="text-2xl md:text-lg font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
              {sum.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center justify-between text-xs cursor-pointer"
          >
            <span className="flex items-center gap-2 text-[#6B6B6B]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: palette[i % palette.length] }}
              />
              <span className="capitalize">{d.label}</span>
            </span>
            <span className="text-[#9C9C9C] tabular-nums">
              <span className="font-medium text-[#0A0A0A]">{val(d).toLocaleString()}</span>
              <span className="ml-1">· {sum > 0 ? Math.round((val(d) / sum) * 100) : 0}%</span>
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No data yet</p>
        )}
      </div>
    </div>
  );
}

export function BarMeter({ label, value, pct, right }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-xs text-[#0A0A0A] truncate">{label}</span>
        <span className="text-[11px] text-[#9C9C9C] tabular-nums shrink-0">
          {right ?? value.toLocaleString()}
        </span>
      </div>
      <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-[#6366F1]"
        />
      </div>
    </div>
  );
}
