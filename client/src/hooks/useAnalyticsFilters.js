import { useState, useMemo, useEffect } from "react";
import { countryNameFromCode } from "../utils/countryCodes";
import { formatShort } from "../utils/format";
import { DEVICE_OPTIONS } from "../utils/timeline";

const DAY = 24 * 60 * 60 * 1000;

const pad2 = (n) => String(n).padStart(2, "0");
const iso = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const daysAgo = (n, base) => iso(toLocalDate(base).getTime() - n * DAY);

export const useAnalyticsFilters = (
  links,
  _analyticsData,
  activeSection,
  selectedDay,
  timelineLimit,
) => {
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [linkId, setLinkId] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");

  const [today, setToday] = useState(() => iso(Date.now()));

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => setToday(iso(Date.now())), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  const { from, to } = useMemo(() => {
    let fromDate;
    let toDate;
    if (range === "custom") {
      fromDate = customFrom || daysAgo(29, today);
      toDate = customTo || today;
    } else {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      fromDate = daysAgo(days - 1, today);
      toDate = today;
    }
    if (fromDate && toDate && fromDate > toDate) {
      [fromDate, toDate] = [toDate, fromDate];
    }
    return { from: fromDate, to: toDate };
  }, [range, customFrom, customTo, today]);

  const params = useMemo(() => {
    const p = {
      from,
      to,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      view: activeSection,
    };
    if (linkId) p.linkId = linkId;
    if (country) p.country = country;
    if (device) p.device = device;
    if (activeSection === "timeline") {
      if (selectedDay && selectedDay >= from && selectedDay <= to)
        p.day = selectedDay;
      p.limit = timelineLimit;
    }
    return p;
  }, [
    from,
    to,
    linkId,
    country,
    device,
    activeSection,
    selectedDay,
    timelineLimit,
  ]);

  const hasFilters = !!(linkId || country || device || range !== "30d");
  const activeFilterCount = [linkId, country, device, range !== "30d"].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setRange("30d");
    setCustomFrom("");
    setCustomTo("");
    setLinkId("");
    setCountry("");
    setDevice("");
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (linkId) {
      const link = links.find((l) => l.id === Number(linkId));
      chips.push({
        key: "link",
        label: link ? `Link: ${link.short_code}` : `Link #${linkId}`,
        clear: () => setLinkId(""),
      });
    }
    if (country) {
      chips.push({
        key: "country",
        label: `Country: ${countryNameFromCode(country) || country}`,
        clear: () => setCountry(""),
      });
    }
    if (device) {
      chips.push({
        key: "device",
        label: `Device: ${DEVICE_OPTIONS.find((o) => o.value === device)?.label ?? device}`,
        clear: () => setDevice(""),
      });
    }
    if (range !== "30d") {
      chips.push({
        key: "range",
        label:
          range === "custom"
            ? `${formatShort(customFrom || from)} – ${formatShort(customTo || to)}`
            : `${range.toUpperCase()} range`,
        clear: () => {
          setRange("30d");
          setCustomFrom("");
          setCustomTo("");
        },
      });
    }
    return chips;
  }, [linkId, country, device, range, customFrom, customTo, from, to, links]);

  const daysInRange = Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY) + 1,
  );

  return {
    range,
    setRange,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    linkId,
    setLinkId,
    country,
    setCountry,
    device,
    setDevice,
    from,
    to,
    params,
    hasFilters,
    activeFilterCount,
    clearFilters,
    activeChips,
    daysInRange,
    today,
  };
};
