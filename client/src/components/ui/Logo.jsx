import React from 'react';

const Logo = ({ className = "w-6 h-6", bg = "#111827", fg = "#ffffff", dot = "#10b981" }) => {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill={bg} />
      <path d="M 10 8 H 5 V 12 H 10 V 16 H 5" fill="none" stroke={fg} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
      <line x1="14" y1="5" x2="14" y2="16" stroke={fg} strokeWidth="2.5" strokeLinecap="square" />
      <rect x="17" y="14" width="2.5" height="2.5" fill={dot} />
    </svg>
  );
};

export default Logo;
