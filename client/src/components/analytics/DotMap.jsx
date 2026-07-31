// Approximate [lat, lon] for common countries (ISO-2 → coordinates)
const COORDS = {
  US: [39.8, -98.6], IN: [20.6, 79.0], GB: [54.0, -2.0], DE: [51.2, 10.4],
  FR: [46.2, 2.2], BR: [-10.0, -52.0], CA: [56.1, -106.3], AU: [-25.3, 133.8],
  JP: [36.2, 138.2], KR: [35.9, 127.8], RU: [61.5, 105.3], IT: [41.9, 12.6],
  ES: [40.5, -3.7], NL: [52.1, 5.3], SE: [60.1, 18.6], PL: [51.9, 19.1],
  TR: [39.9, 32.9], ID: [-0.8, 113.9], MX: [23.6, -102.5], AR: [-38.4, -63.6],
  ZA: [-30.6, 22.9], NG: [9.1, 8.7], EG: [26.8, 30.8], SA: [23.9, 45.1],
  AE: [23.4, 53.8], SG: [1.35, 103.8], MY: [4.2, 102.0], TH: [15.9, 100.9],
  VN: [14.1, 108.3], PH: [12.9, 121.8], PK: [30.4, 69.3], BD: [23.7, 90.4],
  UA: [48.4, 31.2], RO: [45.9, 25.0], CZ: [49.8, 15.5], AT: [47.5, 14.6],
  CH: [46.8, 8.2], BE: [50.5, 4.5], PT: [39.4, -8.2], GR: [39.1, 21.8],
  IL: [31.0, 34.9], NZ: [-40.9, 174.9], IE: [53.4, -8.2], NO: [60.5, 8.5],
  DK: [56.3, 9.5], FI: [61.9, 25.7], HK: [22.3, 114.2], TW: [23.7, 121.0],
  CL: [-35.7, -71.5], CO: [4.6, -74.3], PE: [-9.2, -75.0], KZ: [48.0, 66.9],
};

const project = ([lat, lon]) => {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
};

const DotMap = ({ countries }) => {
  const maxClicks = Math.max(...countries.map((c) => c.clicks), 1);

  const dots = countries
    .map((c) => {
      const coord = COORDS[c.country];
      if (!coord) return null;
      return { ...c, ...project(coord) };
    })
    .filter(Boolean);

  return (
    <div className="relative">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-36 sm:h-44">
        {[12.5, 25, 37.5].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.2" />
        ))}
        {dots.map((d) => {
          const r = 0.7 + (d.clicks / maxClicks) * 1.6;
          return (
            <circle
              key={d.country}
              cx={d.x}
              cy={d.y}
              r={r}
              fill="#10b981"
              opacity={0.35 + (d.clicks / maxClicks) * 0.65}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {dots.slice(0, 5).map((d) => (
          <span key={d.country} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span
              className="w-2 h-2 rounded-full"
              style={{ opacity: 0.5 + (d.clicks / maxClicks) * 0.5 }}
            />
            <span className="font-medium bg-gray-900 text-white">{d.country}</span>
            <span className="text-gray-400 tabular-nums">{d.clicks.toLocaleString()}</span>
          </span>
        ))}
        {dots.length === 0 && (
          <span className="text-xs text-gray-400">No location data yet</span>
        )}
      </div>
    </div>
  );
};

export default DotMap;
