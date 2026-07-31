import { useId } from "react";
import { motion } from "motion/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

const ACCENT = "#10b981";
const GRID = "#f3f4f6";
const TICK = { fontSize: 10, fill: "#9ca3af" };

// Match the app's Inter-based typography inside MUI charts (tooltips, ticks)
const chartsTheme = createTheme({
  typography: { fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif" },
});

export function AreaChart({ data, color = ACCENT, height = 160 }) {
  const gradientId = useId().replace(/[:]/g, "");
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value ?? 0);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-xs text-gray-400">No data in this period</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={chartsTheme}>
      <LineChart
        height={height}
        margin={{ top: 10, right: 4, bottom: 4, left: 4 }}
        grid={{ horizontal: true, vertical: false }}
        xAxis={[
          {
            scaleType: "band",
            data: labels,
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: TICK,
            tickLabelInterval: (value, index) =>
              index === 0 || index === labels.length - 1,
          },
        ]}
        yAxis={[{ scaleType: "linear", position: "none" }]}
        series={[
          {
            data: values,
            area: true,
            color,
            curve: "natural",
            showMark: "end",
            valueFormatter: (v) => (v ?? 0).toLocaleString(),
          },
        ]}
        hideLegend
        slotProps={{
          area: { style: { fill: `url(#${gradientId})` } },
        }}
        sx={{
          "& .MuiChartsGrid-line": { stroke: GRID },
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </LineChart>
    </ThemeProvider>
  );
}

export function DonutChart({ data, centerValue, centerLabel, total }) {
  // Support both { label, value } and { label, clicks } payloads
  const val = (d) => d.value ?? d.clicks ?? 0;
  const sum = total ?? data.reduce((acc, d) => acc + val(d), 0);

  const palette = ["#10b981", "#34d399", "#059669", "#6ee7b7", "#a7f3d0", "#10b981"];

  const items = data.map((d, i) => ({
    id: i,
    label: d.label,
    value: val(d),
    color: palette[i % palette.length],
  }));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44 md:w-32 md:h-32">
        {items.length > 0 ? (
          <ThemeProvider theme={chartsTheme}>
            <PieChart
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              series={[
                {
                  data: items,
                  innerRadius: "63%",
                  outerRadius: "85%",
                  cornerRadius: 3,
                  paddingAngle: 1.5,
                  // v9 passes the full pie item ({id, label, value, color}) here,
                  // not a bare number — format item.value to avoid "[object Object]"
                  valueFormatter: (item) => (item?.value ?? 0).toLocaleString(),
                },
              ]}
              hideLegend
            />
          </ThemeProvider>
        ) : (
          <div className="w-full h-full rounded-full border-[9px] border-gray-100" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl md:text-lg font-bold text-gray-900 tabular-nums">
            {centerValue ?? sum.toLocaleString()}
          </span>
          <span className="text-[10px] md:text-[9px] uppercase tracking-wider text-gray-400">
            {centerLabel ?? "clicks"}
          </span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: palette[i % palette.length] }}
              />
              <span className="capitalize">{d.label}</span>
            </span>
            <span className="text-gray-400 tabular-nums">
              {sum > 0 ? Math.round((val(d) / sum) * 100) : 0}%
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
        <span className="text-xs text-gray-700 truncate">{label}</span>
        <span className="text-[11px] text-gray-400 tabular-nums shrink-0">
          {right ?? value.toLocaleString()}
        </span>
      </div>
      <div className="h-1 bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-[#10b981]"
        />
      </div>
    </div>
  );
}
