export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

export const getGreeting = () => {
  const time = getTimeOfDay();
  if (time === "morning") return "Good morning";
  if (time === "afternoon") return "Good afternoon";
  return "Good evening";
};
