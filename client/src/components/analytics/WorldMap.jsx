import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { scaleQuantize } from "d3-scale";
import { geoMercator } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { buildCountryNameToCode } from "../../utils/countryCodes";
import CountryFlag from "./CountryFlag";
import { LuExpand, LuMinus, LuPlus } from "react-icons/lu";

const RAMP = ["#F5DFDA", "#EBB2AF", "#E37D7B", "#D62828", "#851919"];

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

  const worldFeatures = useMemo(() => {
    const fc = feature(worldAtlas, worldAtlas.objects.countries);
    return fc.features
      .filter((f) => f.properties?.name !== "Antarctica")
      .map((f) => ({ ...f, id: f.properties.name }));
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const fit = () => {
      const w = wrap.clientWidth || 600;
      const h = wrap.clientHeight || 340;
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

  const data = useMemo(() => {
    const byCode = new Map();
    for (const c of countries) {
      const code = String(c?.country ?? "")
        .toUpperCase()
        .trim();
      if (!/^[A-Z]{2}$/.test(code)) continue;
      byCode.set(code, (byCode.get(code) ?? 0) + (c.clicks ?? 0));
    }
    return byCode;
  }, [countries]);

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

  const legendRanges = useMemo(() => {
    const step = maxClicks / RAMP.length;
    return RAMP.map((color, i) => {
      const from = Math.round(step * i);
      const to = i === RAMP.length - 1 ? maxClicks : Math.round(step * (i + 1));
      return {
        color,
        from,
        to,
        label:
          i === 0
            ? `${from}`
            : i === RAMP.length - 1
              ? `${to}+`
              : `${from}–${to}`,
      };
    });
  }, [maxClicks]);

  const onFeatureClick = useCallback(
    (feature) => {
      const name = feature?.properties?.name;
      const b = nameToBounds.get(name);
      const wrap = wrapRef.current;
      if (!b || !wrap) return;
      const w = wrap.clientWidth || 600;
      const h = wrap.clientHeight || 340;
      const [mx, my] = geoMercator().scale(1).translate([0, 0])([
        (b[0] + b[2]) / 2,
        (b[1] + b[3]) / 2,
      ]);
      const spanLon = Math.max(b[2] - b[0], 1);
      const nextScale = Math.max(
        baseScale,
        Math.min(baseScale * 24, (0.4 * w * 360) / (spanLon * 2 * Math.PI)),
      );
      interactedRef.current = true;
      setTranslation([0.5 - (nextScale * mx) / w, 0.5 - (nextScale * my) / h]);
      setScale(nextScale);
    },
    [nameToBounds, baseScale],
  );

  const zoomBy = useCallback(
    (factor) => {
      interactedRef.current = true;
      setScale((s) =>
        Math.max(baseScale, Math.min(baseScale * 24, s * factor)),
      );
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
        <div className="flex flex-col gap-0.5 rounded-lg bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white shadow-lg">
          <span className="font-semibold flex items-center gap-1.5">
            <CountryFlag code={code} className="w-4 h-3" />
            {name}
          </span>
          {value != null ? (
            <span className="text-[11px] text-[#C1C1C9]">
              {Number(value).toLocaleString()}{" "}
              {Number(value) === 1 ? "click" : "clicks"}
            </span>
          ) : (
            <span className="text-[11px] text-[#C1C1C9]">No clicks</span>
          )}
        </div>
      );
    },
    [nameToCode],
  );

  return (
    <div className="w-full">
      <div className="relative" ref={wrapRef}>
        <div className="h-[340px] w-full sm:h-[460px] lg:h-[520px]">
          <ResponsiveChoropleth
            data={chartData}
            features={worldFeatures}
            match="id"
            domain={[0, maxClicks]}
            colors={colorScale}
            unknownColor="#e9e6dd"
            borderWidth={0.6}
            borderColor="#f5f3ee"
            projection="mercator"
            projectionScale={scale}
            projectionTranslation={translation}
            enableGraticule={false}
            tooltip={tooltip}
            onClick={onFeatureClick}
          />
        </div>

        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col overflow-hidden rounded-lg border border-[#141414]/35 bg-[#f5f3ee] shadow-lg">
          <button
            type="button"
            onClick={() => zoomBy(1.6)}
            className="flex h-8 w-8 items-center justify-center text-[#8a8578] transition-colors hover:bg-[#e9e6dd] hover:text-[#141414] cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#d62828]/25 focus-visible:outline-none"
            aria-label="Zoom in"
          >
            <LuPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.6)}
            className="flex h-8 w-8 items-center justify-center border-t border-[#141414]/15 text-[#8a8578] transition-colors hover:bg-[#e9e6dd] hover:text-[#141414] cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#d62828]/25 focus-visible:outline-none"
            aria-label="Zoom out"
          >
            <LuMinus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-8 w-8 items-center justify-center border-t border-[#141414]/15 text-[#8a8578] transition-colors hover:bg-[#e9e6dd] hover:text-[#141414] cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#d62828]/25 focus-visible:outline-none"
            aria-label="Reset map view"
          >
            <LuExpand className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {legendRanges.map((r, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="w-3 h-1.5 rounded-sm"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-[9px] text-[#8a8578]">{r.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-[#8a8578]">
          {data.size > 0
            ? `${data.size} ${data.size === 1 ? "country" : "countries"} · hover to inspect, click to zoom`
            : "No location data yet"}
        </span>
      </div>
    </div>
  );
};

export default WorldMapChart;
