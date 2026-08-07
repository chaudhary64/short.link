const Logo = ({ className = "w-8 h-8", type = "dark" }) => {
  const isLight = type === "light";
  const bg = isLight ? "#ffffff" : "#111827";
  const stroke = isLight ? "#111827" : "#ffffff";

  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      aria-label="short.link logo"
    >
      <rect width="96" height="96" fill={bg} />
      <path
        d="M 40 32 H 20 V 48 H 40 V 64 H 20"
        fill="none"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <line
        x1="56"
        y1="20"
        x2="56"
        y2="64"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="square"
      />
      <rect x="68" y="56" width="10" height="10" fill="#10b981" />
    </svg>
  );
};

export default Logo;
