import api from "./axios";

export async function getAllLinks() {
  const res = await api.get("/links/all");
  return res;
}

export async function createLink({ url }) {
  const res = await api.post("/links", { originalUrl: url });
  return res;
}

export async function updateLink({ id, url }) {
  const res = await api.put("/links/edit", { linkId: String(id), originalUrl: url });
  return res;
}

export async function deleteLink({ id }) {
  const res = await api.delete("/links/delete", { params: { linkId: id } });
  return res;
}
