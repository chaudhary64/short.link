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
    { label: "", color: "bg-gray-200" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-[#10b981]" },
    { label: "Very Strong", color: "bg-[#10b981]" },
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
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 transition-colors duration-200 ${
                i < score ? level.color : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-500 min-w-[70px]">
          {level.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          { key: "length", label: "8+ characters" },
          { key: "uppercase", label: "Uppercase letter" },
          { key: "lowercase", label: "Lowercase letter" },
          { key: "number", label: "Number" },
          { key: "special", label: "Special character" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <svg
              className={`w-3 h-3 shrink-0 transition-colors duration-200 ${
                checks[key] ? "text-[#10b981]" : "text-gray-300"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              {checks[key] ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <circle cx="12" cy="12" r="3" />
              )}
            </svg>
            <span
              className={`text-xs transition-colors duration-200 ${
                checks[key] ? "text-gray-700" : "text-gray-400"
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
