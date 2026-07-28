import React from 'react';

const Logo = ({ className = "w-6 h-6", type = "dark" }) => {
  const src = type === "light" ? "/logo-light-v2.svg" : "/logo-dark-v2.svg";
  return <img src={src} className={className} alt="short.link logo" />;
};

export default Logo;
