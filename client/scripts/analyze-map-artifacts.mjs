// Renderer-accurate artifact scan for the analytics world map.
//
// The app renders via @nivo/geo, which draws through d3-geo's geoPath — a
// spherical renderer that clips the antimeridian natively. This script scans
// the ACTUAL path output (the same path data the browser paints) for wrap
// artifacts — "stray lines": thin, very-wide subpaths that appeared across
// the map when Russia/Fiji/Antarctica crossed the ±180° meridian.
//
// Also runs a contrast scan with a naive planar projection (the behavior that
// forced a custom antimeridian split on the old Leaflet map) so the numbers
// tell the story: naive planar → 8 artifacts (Russia + Fiji), d3-geo
// spherical → 0.
import { readFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const atlas = JSON.parse(
  readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url), "utf8"),
);
const world = feature(atlas, atlas.objects.countries);
const appFeatures = world.features
  .filter((f) => f.properties?.name !== "Antarctica")
  .map((f) => ({ ...f, id: f.properties.name }));

/**
 * Scan path `d` strings for wrap artifacts:
 *  - "jump": consecutive points whose projected x jumps > 30% of the world
 *    width (an antimeridian segment drawn straight across the map)
 *  - "thin": a subpath that is very wide and very thin (a degenerate wrap ring)
 */
function scanPaths(entries, worldWidth) {
  const bad = [];
  for (const { name, d } of entries) {
    if (!d) continue;
    for (const s of d.match(/[ML][^MZ]*/g) || []) {
      const nums = s.match(/-?\d+(\.\d+)?/g);
      if (!nums || nums.length < 4) continue;
      const pts = [];
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (let i = 0; i < nums.length; i += 2) {
        const x = +nums[i], y = +nums[i + 1];
        pts.push([x, y]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      for (let i = 1; i < pts.length; i++) {
        const dx = Math.abs(pts[i][0] - pts[i - 1][0]);
        if (dx > worldWidth * 0.3) {
          bad.push({ feature: name, kind: "jump", wPx: Math.round(dx) });
        }
      }
      if (maxX - minX > worldWidth * 0.3 && maxY - minY < 8) {
        bad.push({ feature: name, kind: "thin", wPx: Math.round(maxX - minX), hPx: +(maxY - minY).toFixed(1) });
      }
    }
  }
  return bad;
}

// ── Actual renderer: d3-geo geoPath (what @nivo/geo paints) ──
const renderPath = geoPath(geoMercator().scale(100));
const d3Entries = appFeatures.map((f) => ({ name: f.properties.name, d: renderPath(f) }));
const d3Artifacts = scanPaths(d3Entries, 628); // 2π·100 ≈ 628px world width at scale 100

// ── Contrast: naive planar projection (old Leaflet-style behavior) ──
const WORLD = 256 * 4; // zoom 2
const yOf = (lat) =>
  WORLD / 2 - (WORLD / (2 * Math.PI)) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const xOf = (lon) => ((lon + 180) / 360) * WORLD;
const naiveEntries = [];
for (const f of appFeatures) {
  const polys =
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = "";
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(([lon, lat]) => `${xOf(lon)},${yOf(lat)}`);
      d += `M${pts.join("L")}Z`;
    }
  }
  naiveEntries.push({ name: f.properties.name, d });
}
const naiveArtifacts = scanPaths(naiveEntries, WORLD);

console.log(`features: ${appFeatures.length} (world minus Antarctica)`);
console.log(`artifacts with naive planar projection (old Leaflet-style): ${naiveArtifacts.length}`);
for (const r of naiveArtifacts) console.log("  naive:", JSON.stringify(r));
console.log(`artifacts with d3-geo geoPath (current Nivo renderer): ${d3Artifacts.length}`);
for (const r of d3Artifacts) console.log("  d3:", JSON.stringify(r));
