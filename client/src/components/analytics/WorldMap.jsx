import WorldMap from "react-svg-worldmap";

const ACCENT = "#10b981";
const BASE = "#f3f4f6";

const WorldMapChart = ({ countries }) => {
  const data = (countries ?? [])
    .filter((c) => c?.country && (c.clicks ?? 0) > 0)
    .map((c) => ({ country: c.country.toLowerCase(), value: c.clicks }));

  return (
    <div className="mx-auto w-full max-w-lg">
      <WorldMap
        data={data}
        size="responsive"
        valueSuffix="clicks"
        richInteraction
        borderColor="#cbd5e1"
        backgroundColor="transparent"
        styleFunction={(context) => ({
          fill: context.countryValue ? ACCENT : BASE,
          stroke: "#cbd5e1",
          strokeWidth: 0.9,
          vectorEffect: "non-scaling-stroke",
          cursor: context.countryValue ? "pointer" : "default",
        })}
        tooltipTextFunction={(ctx) =>
          ctx.countryValue
            ? `${ctx.countryName}: ${ctx.countryValue.toLocaleString()} clicks`
            : ctx.countryName
        }
      />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Fewer</span>
          <div
            className="h-1.5 w-24 rounded-sm"
            style={{
              background: `linear-gradient(to right, ${ACCENT}26, ${ACCENT})`,
            }}
          />
          <span className="text-[10px] text-gray-400">More</span>
        </div>
        <span className="text-[11px] tabular-nums text-gray-400">
          {data.length > 0
            ? `${data.length} ${data.length === 1 ? "country" : "countries"}`
            : "No location data yet"}
        </span>
      </div>
    </div>
  );
};

export default WorldMapChart;
