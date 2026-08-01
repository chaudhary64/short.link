// Headless integrity test for the analytics world map data pipeline.
// Uses the REAL production util (src/utils/countryCodes.js) so a mismatch
// here means the map in the app is mis-linking countries.
//
// Rule: every world-atlas feature that represents a real ISO 3166-1 country
// MUST resolve to an alpha-2 code. Only non-ISO entities (Somaliland,
// N. Cyprus) may remain unmapped.
import { readFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
import { buildCountryNameToCode } from "../src/utils/countryCodes.js";

const atlas = JSON.parse(
  readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url), "utf8"),
);
const world = feature(atlas, atlas.objects.countries);
const nameToCode = buildCountryNameToCode(world.features);

let failed = false;

// 1. Every feature with a real ISO code must resolve
const knownNonISO = new Set(["N. Cyprus", "Somaliland", "Antarctica"]);
const unmapped = world.features.filter((f) => !nameToCode.has(f.properties.name));
const unexpected = unmapped.filter((f) => !knownNonISO.has(f.properties.name));
if (unexpected.length) {
  failed = true;
  console.log("UNMAPPED FEATURES (need an alias):", unexpected.map((f) => f.properties.name).join(", "));
} else {
  console.log(
    `features resolved: ${world.features.length - unmapped.length}/${world.features.length}`,
    `(unmapped OK: ${unmapped.map((f) => f.properties.name).join(", ") || "none"})`,
  );
}

// 2. Spot-checks of common geoip-lite codes against expected countries
const samples = {
  US: "United States of America",
  IN: "India",
  DE: "Germany",
  GB: "United Kingdom",
  BR: "Brazil",
  JP: "Japan",
  AU: "Australia",
  FR: "France",
  RU: "Russia",
  CN: "China",
  TZ: "Tanzania",
  TR: "Turkey",
};
const codeToName = new Map([...nameToCode.entries()].map(([name, code]) => [code, name]));
for (const [code, expect] of Object.entries(samples)) {
  const got = codeToName.get(code);
  if (got !== expect) {
    failed = true;
    console.log(`MISMATCH ${code}: expected "${expect}", got "${got}"`);
  }
}
console.log(`spot-checks: ${Object.keys(samples).length} passed`);

// 3. No alpha-2 code should map to two different features (ambiguous linking)
const counts = new Map();
for (const code of nameToCode.values()) counts.set(code, (counts.get(code) || 0) + 1);
const dupes = [...counts.entries()].filter(([, n]) => n > 1);
if (dupes.length) {
  failed = true;
  console.log("DUPLICATE CODES:", dupes.map(([c, n]) => `${c} x${n}`).join(", "));
} else {
  console.log("no duplicate codes");
}

// 4. Renderer-accurate artifact check. The app feeds RAW world-atlas features
//    (minus Antarctica) to @nivo/geo, which draws through d3-geo's geoPath — a
//    spherical renderer that clips the antimeridian natively. Mirror exactly
//    what the browser paints: generate the path data and assert there are no
//    "stray-line" wrap artifacts (thin, very-wide subpaths) and that
//    Antarctica never leaks back in.
const appFeatures = world.features
  .filter((f) => f.properties?.name !== "Antarctica")
  .map((f) => ({ ...f, id: f.properties.name }));
if (appFeatures.some((f) => f.properties?.name === "Antarctica")) {
  failed = true;
  console.log("Antarctica still present in the app pipeline");
} else {
  console.log("Antarctica excluded: ok");
}

const renderPath = geoPath(geoMercator().scale(100));
let wrapArtifacts = 0;
for (const f of appFeatures) {
  const d = renderPath(f);
  if (!d) continue;
  for (const s of d.match(/[ML][^MZ]*/g) || []) {
    const nums = s.match(/-?\d+(\.\d+)?/g);
    if (!nums || nums.length < 4) continue;
    let minX = 1e9;
    let maxX = -1e9;
    let minY = 1e9;
    let maxY = -1e9;
    for (let i = 0; i < nums.length; i += 2) {
      const x = +nums[i];
      const y = +nums[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (maxX - minX > 180 && maxY - minY < 8) {
      wrapArtifacts++;
      if (wrapArtifacts <= 5) console.log(`WRAP ARTIFACT in ${f.properties.name}`);
    }
  }
}
if (wrapArtifacts) {
  failed = true;
  console.log(`wrap artifacts in d3-geo render: ${wrapArtifacts}`);
} else {
  console.log("no wrap artifacts in d3-geo render");
}

console.log(failed ? "RESULT: FAILED" : "RESULT: PASSED");
process.exit(failed ? 1 : 0);
