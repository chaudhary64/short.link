import countries from "world-countries";

// Auto-match: every common and official country name from world-countries
// (the ISO 3166-1 registry) resolves to its alpha-2 code.
const AUTO = new Map();
for (const c of countries) {
  AUTO.set(c.name.common, c.cca2);
  AUTO.set(c.name.official, c.cca2);
}

// Curated aliases for world-atlas feature names that don't match any
// common/official name in world-countries (abbreviations, legacy names,
// diacritics, and names that changed). Kept in sync by
// client/scripts/validate-map-linking.mjs, which fails if a feature
// with a real ISO code is left unmapped.
const ALIASES = {
  "W. Sahara": "EH", // Western Sahara
  "Dem. Rep. Congo": "CD", // DR Congo
  Congo: "CG", // Republic of the Congo
  "Dominican Rep.": "DO", // Dominican Republic
  "Falkland Is.": "FK", // Falkland Islands
  "Fr. S. Antarctic Lands": "TF", // French Southern and Antarctic Lands
  "Central African Rep.": "CF", // Central African Republic
  "Eq. Guinea": "GQ", // Equatorial Guinea
  eSwatini: "SZ", // Eswatini (world-atlas uses lowercase "e")
  "Côte d'Ivoire": "CI", // Ivory Coast
  "Solomon Is.": "SB", // Solomon Islands
  "Bosnia and Herz.": "BA", // Bosnia and Herzegovina
  Macedonia: "MK", // North Macedonia
  "S. Sudan": "SS", // South Sudan
  Turkey: "TR", // Türkiye
  Tanzania: "TZ", // Tanzania, United Republic of
};

/**
 * Build a Map<featureName, alpha2> from a GeoJSON FeatureCollection of
 * countries (e.g. world-atlas). Only features that resolve to a real ISO
 * alpha-2 code are included — non-ISO entities like Somaliland and
 * Northern Cyprus are skipped and simply render in the base color.
 */
export function buildCountryNameToCode(features) {
  const map = new Map();
  for (const f of features) {
    const name = f.properties?.name;
    if (!name) continue;
    const code = ALIASES[name] ?? AUTO.get(name);
    if (code) map.set(name, code);
  }
  return map;
}
