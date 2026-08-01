import api from "./axios";

export default async function refreshToken() {
  const res = await api.get("/api/auth/refresh", { timeout: 10000 });
  return res;
}
