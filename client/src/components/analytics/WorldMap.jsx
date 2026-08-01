import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { scaleQuantize } from "d3-scale";
import { geoMercator } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { buildCountryNameToCode } from "../../utils/countryCodes";
import { flagEmoji } from "../../utils/format";

// ── Color scale: emerald ramp, light → deep ──
const RAMP = ["#d1fae5", "#6ee7b7", "#34d399", "#059669", "#047857"];

/** Bounding box of a GeoJSON feature in [minLon, minLat, maxLon, maxLat].
 * Longitudes are unwrapped so rings that cross the ±180° seam (Russia, Fiji)
 * get their real contiguous extent instead of a full-width [-180, 180] box. */
function featureBounds(f) {
  const g = f.geometry;
  const rings = g.type === "Polygon" ? g.coordinates : g.coordinates.flat();
  let minLon = 180;
  let maxLon = -180;
  let minLat = 90;
  let maxLat = -90;
  for (const ring of rings) {
    let prev = null;
    for (const [lon0, lat] of ring) {
      let lon = lon0;
      if (prev !== null) {
        while (lon - prev > 180) lon -= 360;
        while (lon - prev < -180) lon += 360;
      }
      prev = lon;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLon, minLat, maxLon, maxLat];
}

const WorldMapChart = ({ countries = [] }) => {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(100);
  const [baseScale, setBaseScale] = useState(100);
  const [translation, setTranslation] = useState([0.5, 0.5]);
  const [baseTranslation, setBaseTranslation] = useState([0.5, 0.5]);
  const interactedRef = useRef(false);

  // Raw world-atlas features — d3-geo (which @nivo/geo renders through) clips
  // the antimeridian spherically, so no ring splitting is needed. Antarctica
  // is dropped (it never has click data) and each feature gets a top-level
  // `id` so nivo's default match="id" and React keys work.
  const worldFeatures = useMemo(() => {
    const fc = feature(worldAtlas, worldAtlas.objects.countries);
    return fc.features
      .filter((f) => f.properties?.name !== "Antarctica")
      .map((f) => ({ ...f, id: f.properties.name }));
  }, []);

  // Auto-fit: the mercator world is ~1.5:1 (not square), so size it with d3's
  // fitExtent against the actual container — the map fills the available area
  // instead of being shrunk to the smaller dimension. Re-fits on resize until
  // the user interacts.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const fit = () => {
      const w = wrap.clientWidth || 600;
      const h = wrap.clientHeight || 340;
      // Bail on degenerate sizes so fitExtent never sees an inverted extent
      // (which would yield a NaN scale and corrupt the projection).
      if (w <= 16 || h <= 16) return;
      const projection = geoMercator().fitExtent(
        [
          [8, 8],
          [w - 8, h - 8],
        ],
        { type: "FeatureCollection", features: worldFeatures },
      );
      const next = Math.max(30, Math.round(projection.scale()));
      const [px, py] = projection.translate();
      const nextTranslation = [px / w, py / h];
      // Only touch state when something actually changed (fresh arrays defeat
      // React's Object.is bailout on every resize callback).
      setBaseScale((prev) => (prev === next ? prev : next));
      setBaseTranslation((prev) =>
        prev[0] === nextTranslation[0] && prev[1] === nextTranslation[1]
          ? prev
          : nextTranslation,
      );
      if (!interactedRef.current) {
        setScale((prev) => (prev === next ? prev : next));
        setTranslation((prev) =>
          prev[0] === nextTranslation[0] && prev[1] === nextTranslation[1]
            ? prev
            : nextTranslation,
        );
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [worldFeatures]);

  // alpha-2 code -> total clicks (rows are already grouped by the API)
  const data = useMemo(() => {
    const byCode = new Map();
    for (const c of countries) {
      const code = String(c?.country ?? "").toUpperCase().trim();
      if (!/^[A-Z]{2}$/.test(code)) continue;
      byCode.set(code, (byCode.get(code) ?? 0) + (c.clicks ?? 0));
    }
    return byCode;
  }, [countries]);

  // name -> code, and its inverse (unique per code — enforced by the
  // validate-map-linking.mjs integrity test).
  const nameToCode = useMemo(
    () => buildCountryNameToCode(worldFeatures),
    [worldFeatures],
  );
  const codeToName = useMemo(() => {
    const m = new Map();
    for (const [name, code] of nameToCode) m.set(code, name);
    return m;
  }, [nameToCode]);

  const nameToBounds = useMemo(() => {
    const m = new Map();
    for (const f of worldFeatures) m.set(f.properties.name, featureBounds(f));
    return m;
  }, [worldFeatures]);

  const maxClicks = Math.max(...data.values(), 1);

  // [{ id: <feature name>, value }] — nivo matches data ids to features by
  // the `id` we set on each feature.
  const chartData = useMemo(
    () =>
      [...data.entries()]
        .filter(([code]) => codeToName.has(code))
        .map(([code, value]) => ({ id: codeToName.get(code), value })),
    [data, codeToName],
  );

  const colorScale = useMemo(
    () => scaleQuantize().domain([0, maxClicks]).range(RAMP),
    [maxClicks],
  );

  // Click a country → zoom into it (d3 projection math on the current scale).
  const onFeatureClick = useCallback(
    (feature) => {
      const name = feature?.properties?.name;
      const b = nameToBounds.get(name);
      const wrap = wrapRef.current;
      if (!b || !wrap) return;
      const w = wrap.clientWidth || 600;
      const h = wrap.clientHeight || 340;

      // Project the centroid with scale 1 so the mercator offset is
      // scale-independent, then apply the target scale in the translation.
      const [mx, my] = geoMercator()
        .scale(1)
        .translate([0, 0])([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]);
      const spanLon = Math.max(b[2] - b[0], 1);
      const nextScale = Math.max(
        baseScale,
        Math.min(baseScale * 24, (0.4 * w * 360) / (spanLon * 2 * Math.PI)),
      );
      // translation fractions that land the country centroid at the container
      // center — independent of baseTranslation, so 0.5 stays hardcoded
      // (the translate that centers a point is 0.5 - scale·offset / dim).
      interactedRef.current = true;
      setTranslation([0.5 - (nextScale * mx) / w, 0.5 - (nextScale * my) / h]);
      setScale(nextScale);
    },
    [nameToBounds, baseScale],
  );

  const zoomBy = useCallback(
    (factor) => {
      interactedRef.current = true;
      setScale((s) => Math.max(baseScale, Math.min(baseScale * 24, s * factor)));
    },
    [baseScale],
  );
  const resetView = useCallback(() => {
    interactedRef.current = false;
    setScale(baseScale);
    setTranslation(baseTranslation);
  }, [baseScale, baseTranslation]);

  const tooltip = useCallback(
    ({ feature }) => {
      const name = feature?.properties?.name;
      const code = nameToCode.get(name);
      const value = feature?.value;
      return (
        <div className="flex flex-col gap-0.5 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-gray-50 shadow-lg">
          <span className="font-semibold">
            {flagEmoji(code)} {name}
          </span>
          {value != null ? (
            <span className="text-[11px] opacity-75">
              {Number(value).toLocaleString()} {Number(value) === 1 ? "click" : "clicks"}
            </span>
          ) : (
            <span className="text-[11px] opacity-50">No clicks</span>
          )}
        </div>
      );
    },
    [nameToCode],
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative" ref={wrapRef}>
        <div className="h-[340px] w-full sm:h-[460px]">
          <ResponsiveChoropleth
            data={chartData}
            features={worldFeatures}
            match="id"
            domain={[0, maxClicks]}
            colors={colorScale}
            unknownColor="#e5e7eb"
            borderWidth={0.6}
            borderColor="#ffffff"
            projection="mercator"
            projectionScale={scale}
            projectionTranslation={translation}
            enableGraticule={false}
            tooltip={tooltip}
            onClick={onFeatureClick}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute right-2.5 top-2.5 z-[1000] flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => zoomBy(1.6)}
            className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.6)}
            className="flex h-7 w-7 items-center justify-center border-t border-gray-200 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-7 w-7 items-center justify-center border-t border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            aria-label="Reset map view"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Fewer</span>
          <div
            className="h-1.5 w-24 rounded-sm"
            style={{ background: `linear-gradient(to right, ${RAMP[0]}, ${RAMP[RAMP.length - 1]})` }}
          />
          <span className="text-[10px] text-gray-400">More</span>
        </div>
        <span className="text-[11px] tabular-nums text-gray-400">
          {data.size > 0
            ? `${data.size} ${data.size === 1 ? "country" : "countries"} · hover to inspect, click to zoom`
            : "No location data yet"}
        </span>
      </div>
    </div>
  );
};

export default WorldMapChart;
