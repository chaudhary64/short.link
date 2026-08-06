const Card = ({
  title,
  icon,
  right,
  className = "",
  titleClassName = "",
  children,
}) => (
  <div className={`g-panel ${className}`}>
    {(title || icon || right) && (
      <div className="g-panel-head">
        <span
          className={`g-panel-title ${titleClassName}`}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          {title}
        </span>
        {right}
      </div>
    )}
    <div className="g-panel-body">{children}</div>
  </div>
);

export default Card;
