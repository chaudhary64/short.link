import { useMemo } from "react";

const getStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const levels = [
    { label: "", color: "#d6d2c7" },
    { label: "Weak", color: "#d62828" },
    { label: "Fair", color: "#b45309" },
    { label: "Good", color: "#b45309" },
    { label: "Strong", color: "#1e7d4f" },
    { label: "Very Strong", color: "#1e7d4f" },
  ];

  return { score, checks, level: levels[score] };
};

const PasswordStrength = ({ password }) => {
  const { score, checks, level } = useMemo(
    () => getStrength(password),
    [password]
  );

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1"
              style={{ backgroundColor: i < score ? level.color : "#e4e1d8" }}
            />
          ))}
        </div>
        {level.label && (
          <span className="g-chip" style={{ borderColor: level.color, color: level.color }}>
            {level.label.toUpperCase()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          { key: "length", label: "8+ characters" },
          { key: "uppercase", label: "Uppercase letter" },
          { key: "lowercase", label: "Lowercase letter" },
          { key: "number", label: "Number" },
          { key: "special", label: "Special character" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 shrink-0 ${checks[key] ? "" : "border border-[#8a8578]"}`}
              style={{ backgroundColor: checks[key] ? "#1e7d4f" : "transparent" }}
              aria-hidden
            />
            <span
              className={`text-xs transition-colors duration-200 ${
                checks[key] ? "text-[#141414]" : "text-[#8a8578]"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
