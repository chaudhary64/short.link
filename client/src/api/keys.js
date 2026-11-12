import api from "./axios";

export async function getApiKeys() {
  const res = await api.get("/api/keys");
  return res;
}

export async function createApiKey({ name, scopes }) {
  const res = await api.post("/api/keys", { name, scopes });
  return res;
}

export async function revokeApiKey(id) {
  const res = await api.delete(`/api/keys/${id}`);
  return res;
}
