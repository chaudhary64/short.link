import countries from "world-countries";

const AUTO = new Map();
for (const c of countries) {
  AUTO.set(c.name.common, c.cca2);
  AUTO.set(c.name.official, c.cca2);
}

const CODE_TO_NAME = new Map();
for (const c of countries) {
  CODE_TO_NAME.set(c.cca2, c.name.common);
}

export function countryNameFromCode(code) {
  if (!code) return "";
  return CODE_TO_NAME.get(String(code).toUpperCase().trim()) || "";
}

const ALIASES = {
  "W. Sahara": "EH",
  "Dem. Rep. Congo": "CD",
  Congo: "CG",
  "Dominican Rep.": "DO",
  "Falkland Is.": "FK",
  "Fr. S. Antarctic Lands": "TF",
  "Central African Rep.": "CF",
  "Eq. Guinea": "GQ",
  eSwatini: "SZ",
  "Côte d'Ivoire": "CI",
  "Solomon Is.": "SB",
  "Bosnia and Herz.": "BA",
  Macedonia: "MK",
  "S. Sudan": "SS",
  Turkey: "TR",
  Tanzania: "TZ",
};

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
