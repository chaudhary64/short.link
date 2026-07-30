import api from "./axios";

export async function getAllLinks() {
  const res = await api.get("/api/links");
  return res;
}

export async function createLink({ url }) {
  const res = await api.post("/api/links", { originalUrl: url });
  return res;
}

export async function createGuestLink({ url }) {
  const res = await api.post("/api/links/guest", { originalUrl: url });
  return res;
}

export async function updateLink({ id, url }) {
  const res = await api.put(`/api/links/${id}`, { originalUrl: url });
  return res;
}

export async function updateLinkStatus({ id, status }) {
  const res = await api.patch(`/api/links/${id}/status`, { status });
  return res;
}

export async function deleteLink({ id }) {
  const res = await api.delete(`/api/links/${id}`);
  return res;
}

export async function convertGuestLink({ shortCode, fingerprint }) {
  const res = await api.post("/api/links/convert-guest", {
    short_code: shortCode,
    fingerprint,
  });
  return res;
}
