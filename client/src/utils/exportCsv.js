export function exportCsv(rows, filename = "analytics.csv") {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTopLinksCsv(topLinks) {
  const rows = topLinks.map((l, i) => ({
    "#": i + 1,
    "Short URL": l.short_code,
    Status: l.status === "active" ? "Active" : "Disabled",
    Clicks: l.clicks ?? 0,
    Unique: l.unique ?? 0,
    Countries: l.countries ?? 0,
    "CTR %": l.ctr ?? 0,
    Created: l.created_at ? new Date(l.created_at).toLocaleString() : "",
    Updated: l.updated_at ? new Date(l.updated_at).toLocaleString() : "",
    "Last Click": l.last_click_at ? new Date(l.last_click_at).toLocaleString() : "",
  }));
  exportCsv(rows, "top-links.csv");
}

export function exportCountriesCsv(topCountries, totalClicks) {
  const rows = topCountries.map((c, i) => ({
    "#": i + 1,
    Country: c.country,
    Clicks: c.clicks ?? 0,
    "Share %": totalClicks > 0 ? Math.round(((c.clicks ?? 0) / totalClicks) * 100) : 0,
  }));
  exportCsv(rows, "countries.csv");
}

export function exportTimelineCsv(timeline) {
  const rows = timeline.map((t) => ({
    Time: t.clicked_at ? new Date(t.clicked_at).toLocaleString() : "",
    Link: t.short_code,
    URL: t.original_url ?? "",
    Device: t.device_type ?? "",
    Browser: t.browser ?? "",
    OS: t.os ?? "",
    Country: t.country ?? "",
    City: t.city ?? "",
  }));
  exportCsv(rows, "click-timeline.csv");
}
