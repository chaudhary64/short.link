import api from "./axios";

export async function getAnalytics(params = {}) {
  const res = await api.get("/api/analytics", { params });
  return res;
}
