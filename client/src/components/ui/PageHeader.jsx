const PageHeader = ({ title, subtitle, children, className = "" }) => {
  return (
    <header
      className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-[#6B6B6B] mt-1.5">{subtitle}</p>
        )}
      </div>
      {children}
    </header>
  );
};

export default PageHeader;
