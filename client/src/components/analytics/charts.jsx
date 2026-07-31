import { useId } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { flagEmoji } from "../../utils/format";

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
      <div className="relative w-24 h-24">
        {items.length > 0 ? (
          <ThemeProvider theme={chartsTheme}>
            <PieChart
              width={96}
              height={96}
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
          <div className="w-24 h-24 rounded-full border-[9px] border-gray-100" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-gray-900 tabular-nums">
            {centerValue ?? sum.toLocaleString()}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gray-400">
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

export function CountryBarChart({ data }) {
  if (!data.length) {
    return <p className="text-xs text-gray-400">No country data yet</p>;
  }

  const labels = data.map((c) => `${flagEmoji(c.country)} ${c.country}`);
  const values = data.map((c) => c.clicks);

  return (
    <ThemeProvider theme={chartsTheme}>
      <BarChart
        layout="horizontal"
        height={Math.max(data.length * 30 + 16, 100)}
        margin={{ top: 4, bottom: 0, left: 104, right: 8 }}
        xAxis={[{ scaleType: "linear", position: "none" }]}
        yAxis={[
          {
            scaleType: "band",
            data: labels,
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: { fontSize: 11, fill: "#4b5563" },
            categoryGapRatio: 0.6,
          },
        ]}
        series={[
          {
            data: values,
            color: ACCENT,
            minBarSize: 2,
            valueFormatter: (v) => (v ?? 0).toLocaleString(),
          },
        ]}
        hideLegend
        borderRadius={3}
      />
    </ThemeProvider>
  );
}
