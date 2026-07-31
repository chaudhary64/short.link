import { useId } from "react";
import { motion } from "motion/react";

const ACCENT = "#10b981";

export function AreaChart({ data, color = ACCENT, height = 160 }) {
  const gradientId = useId().replace(/[:]/g, "");
  const values = data.map((d) => d.value ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);

  const W = 100;
  const H = 32;
  const pad = 2;

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-xs text-gray-400">No data in this period</p>
      </div>
    );
  }

  const coords = data.map((d, i) => {
    const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
    const y = pad + (1 - (d.value - min) / span) * (H - pad * 2);
    return [x, y];
  });

  const points = coords.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${points} ${W},${H} 0,${H} Z`;

  const last = coords[coords.length - 1];
  const dotTop = (last[1] / H) * 100;

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[8, 16, 24].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#f3f4f6" strokeWidth="0.3" />
          ))}
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={points}
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute right-0 w-2 h-2 bg-[#10b981] -translate-y-1/2 translate-x-1/2"
          style={{ top: `${dotTop}%` }}
        />
      </div>

      {data.length > 1 && (
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-400">{data[0].label}</span>
          <span className="text-[10px] text-gray-400">{data[data.length - 1].label}</span>
        </div>
      )}
    </div>
  );
}

export function DonutChart({ data, centerValue, centerLabel, total }) {
  // Support both { label, value } and { label, clicks } payloads
  const val = (d) => d.value ?? d.clicks ?? 0;
  const sum = total ?? data.reduce((acc, d) => acc + val(d), 0);
  const r = 30;
  const c = 2 * Math.PI * r;

  const palette = ["#10b981", "#34d399", "#059669", "#6ee7b7", "#a7f3d0", "#10b981"];

  const shares = data.map((d) => (sum > 0 ? val(d) / sum : 0));
  const arcs = data.map((d, i) => {
    const share = shares[i];
    const dash = share * c;
    const offset = -shares.slice(0, i).reduce((a, s) => a + s, 0) * c;
    return (
      <circle
        key={`${d.label}-${i}`}
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={palette[i % palette.length]}
        strokeWidth="9"
        strokeDasharray={sum > 0 ? `${dash} ${c - dash}` : `0 ${c}`}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="9" />
          {arcs}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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


