import api from "./axios";

export default async function refreshToken() {
  const res = await api.get("/api/auth/refresh");
  return res;
}
