import InfoTooltip from "./InfoTooltip";

const FilterSelect = ({ label, info, icon, value, onChange, children }) => (
  <label className="flex flex-col gap-1.5 min-w-0">
    {label && (
      <span className="flex items-center gap-1.5 g-flabel">
        {label}
        {info && <InfoTooltip text={info} />}
      </span>
    )}
    <div className="g-select-wrap">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8578] pointer-events-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`g-select ${icon ? "pl-9" : ""}`}
      >
        {children}
      </select>
    </div>
  </label>
);

export default FilterSelect;
