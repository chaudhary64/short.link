import { LuArrowDown } from "react-icons/lu";
import InfoTooltip from "./InfoTooltip";

const Mark = () => <span className="g-mark" aria-hidden />;

const Description = ({ description }) => {
  if (description && typeof description === "object") {
    const on = description.tone === "positive";
    return (
      <p className={`g-delta ${on ? "on" : ""}`}>
        {on ? "▲ " : "· "}
        {description.text.toUpperCase()}
      </p>
    );
  }
  return <p className="g-cell-note">{description}</p>;
};

const StatCard = ({
  title,
  value,
  description,
  delta,
  spark,
  sparkMax,
  info,
  titleClassName = "",
}) => (
  <div className="g-cell relative">
    <Mark />
    <span className={`g-cell-label flex items-center gap-1 ${titleClassName}`}>
      {title.toUpperCase()}
      {info && <InfoTooltip text={info} />}
    </span>
    <span className="g-cell-num g-tnum2">{value}</span>
    {description && <Description description={description} />}
    {delta != null && (
      <span
        title="Change vs the previous period"
        className={`g-delta ${delta >= 0 ? "on" : ""}`}
      >
        {delta >= 0 ? (
          <>▲ {Math.abs(delta).toFixed(1)}%</>
        ) : (
          <>
            <LuArrowDown className="w-3 h-3 inline" />{" "}
            {Math.abs(delta).toFixed(1)}%
          </>
        )}
      </span>
    )}
    {spark && (
      <div className="mt-3">
        {sparkMax != null && (
          <div className="flex justify-end mb-0.5">
            <span className="text-[9px] font-bold tabular-nums text-[#8a8578]">
              {Number(sparkMax).toLocaleString()}
            </span>
          </div>
        )}
        {spark}
      </div>
    )}
  </div>
);

export default StatCard;
