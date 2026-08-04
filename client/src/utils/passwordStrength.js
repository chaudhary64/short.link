/**
 * Password strength scoring algorithm
 * Returns a score from 0-4 and feedback message
 */

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "None", color: "#D4D4D8" };

  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (/^[a-zA-Z]+$/.test(password)) score--;
  if (/^[0-9]+$/.test(password)) score--;
  if (/(.)\1{2,}/.test(password)) score--;
  if (/^(password|123456|qwerty)/i.test(password)) score = 0;

  // Normalize score to 0-4
  score = Math.max(0, Math.min(4, Math.floor(score / 1.5)));

  const levels = [
    { label: "Very Weak", color: "#EF4444" },
    { label: "Weak", color: "#F97316" },
    { label: "Fair", color: "#F59E0B" },
    { label: "Strong", color: "#10B981" },
    { label: "Very Strong", color: "#059669" },
  ];

  return {
    score,
    label: levels[score].label,
    color: levels[score].color,
    percentage: (score / 4) * 100,
  };
}

export function getPasswordFeedback(password) {
  if (!password) return [];

  const feedback = [];

  if (password.length < 8) {
    feedback.push("Use at least 8 characters");
  }
  if (password.length < 12) {
    feedback.push("Consider using 12+ characters");
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    feedback.push("Mix uppercase and lowercase letters");
  }
  if (!/[0-9]/.test(password)) {
    feedback.push("Add numbers");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push("Add special characters");
  }
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeated characters");
  }

  return feedback.slice(0, 2);
}