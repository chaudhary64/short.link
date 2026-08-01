import "dotenv/config";
import { createHash } from "node:crypto";
import db from "../db/index.js";
import { usersTable } from "../models/user.schema.js";
import { linksTable } from "../models/links.schema.js";
import { clicksTable } from "../models/analytics.schema.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import { hashPassword } from "../utils/hash.js";

// ── Deterministic PRNG (mulberry32) so re-seeding yields identical data ──
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

const DAY = 24 * 60 * 60 * 1000;

// Demo links — distinct URLs so the per-user (user_id, url_hash) unique index
// never collides with real links the user already created.
const SEED_LINKS = [
  { short_code: "launch", original_url: "https://github.com/motiondivision/motion", created_days_ago: 88, status: "active" },
  { short_code: "docs", original_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", created_days_ago: 76, status: "active" },
  { short_code: "blog", original_url: "https://www.smashingmagazine.com/articles", created_days_ago: 64, status: "active" },
  { short_code: "video", original_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4", created_days_ago: 52, status: "active" },
  { short_code: "repo", original_url: "https://github.com/vercel/next.js", created_days_ago: 41, status: "active" },
  { short_code: "design", original_url: "https://www.figma.com/blog", created_days_ago: 30, status: "active" },
  { short_code: "news", original_url: "https://news.ycombinator.com", created_days_ago: 19, status: "active" },
  { short_code: "app", original_url: "https://vercel.com", created_days_ago: 9, status: "active" },
  { short_code: "archive", original_url: "https://example.com/old-promo", created_days_ago: 2, status: "disabled" },
];

const COUNTRIES = [
  { code: "US", weight: 30, cities: ["New York", "San Francisco", "Austin", "Seattle", "Chicago", "Denver"] },
  { code: "IN", weight: 18, cities: ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Pune", "Chennai"] },
  { code: "GB", weight: 10, cities: ["London", "Manchester", "Bristol", "Edinburgh"] },
  { code: "DE", weight: 8, cities: ["Berlin", "Munich", "Hamburg", "Cologne"] },
  { code: "CA", weight: 6, cities: ["Toronto", "Vancouver", "Montreal", "Calgary"] },
  { code: "AU", weight: 5, cities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
  { code: "BR", weight: 4, cities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"] },
  { code: "FR", weight: 4, cities: ["Paris", "Lyon", "Marseille"] },
  { code: "JP", weight: 3, cities: ["Tokyo", "Osaka", "Kyoto"] },
  { code: "NL", weight: 2, cities: ["Amsterdam", "Rotterdam"] },
  { code: "SG", weight: 2, cities: ["Singapore"] },
  { code: "ES", weight: 2, cities: ["Madrid", "Barcelona"] },
  { code: "IT", weight: 2, cities: ["Rome", "Milan"] },
  { code: "KR", weight: 2, cities: ["Seoul"] },
  { code: "PL", weight: 2, cities: ["Warsaw", "Kraków"] },
];

const DEVICES = [
  {
    type: "desktop",
    weight: 55,
    browsers: { Chrome: 60, Firefox: 15, Safari: 12, Edge: 8, Opera: 5 },
    os: { Windows: 50, macOS: 35, Linux: 15 },
  },
  {
    type: "mobile",
    weight: 38,
    browsers: { Chrome: 55, Safari: 30, "Samsung Internet": 10, Firefox: 5 },
    os: { Android: 60, iOS: 40 },
  },
  {
    type: "tablet",
    weight: 7,
    browsers: { Safari: 55, Chrome: 45 },
    os: { iOS: 60, Android: 40 },
  },
];

function pickWeighted(entries) {
  const total = entries.reduce((s, e) => s + e.weight, 0);
  let r = rand() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

const pickFrom = (obj) => {
  const entries = Object.entries(obj).map(([key, weight]) => ({ key, weight }));
  return pickWeighted(entries).key;
};

const visitorPool = [];
let visitorSeq = 0;
// ~60% of clicks are fresh visitors, ~40% return — so uniqueClicks < clicks.
const pickVisitorHash = () => {
  if (visitorPool.length === 0 || rand() < 0.6) {
    const hash = createHash("sha256").update(`demo-visitor-${++visitorSeq}`).digest("hex");
    visitorPool.push(hash);
    return hash;
  }
  return visitorPool[Math.floor(rand() * visitorPool.length)];
};

async function ensureUser() {
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, 1))
    .limit(1);
  if (existing) {
    console.log(`ℹ️  User id 1 already exists — seeding links + clicks for it.`);
    return 1;
  }

  const password = await hashPassword("demo1234");
  try {
    // id is GENERATED ALWAYS AS IDENTITY, so force it with OVERRIDING SYSTEM VALUE.
    await db.execute(sql`
      INSERT INTO users (id, name, email, gender, password, is_verified, created_at)
      OVERRIDING SYSTEM VALUE
      VALUES (1, 'Demo User', 'demo@short.link', 'other', ${password}, true, now())
      ON CONFLICT (id) DO NOTHING
    `);
    const [created] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, 1))
      .limit(1);
    console.log("✅ Created demo user id 1 →  demo@short.link / demo1234");
    return created?.id ?? 1;
  } catch (err) {
    console.warn("⚠️  Could not create user id 1 (email may exist). Aborting seed.");
    console.warn(err.message);
    process.exit(1);
  }
}

async function seedLinks(userId) {
  const codes = SEED_LINKS.map((l) => l.short_code);

  // Remove previous seed data for THIS user only (cascade deletes its clicks).
  await db
    .delete(linksTable)
    .where(and(eq(linksTable.user_id, userId), inArray(linksTable.short_code, codes)));

  const now = Date.now();
  const values = SEED_LINKS.map((l) => ({
    user_id: userId,
    original_url: l.original_url,
    short_code: l.short_code,
    status: l.status,
    created_at: new Date(now - l.created_days_ago * DAY),
  }));

  // onConflictDoNothing protects against a short_code owned by another user.
  await db.insert(linksTable).values(values).onConflictDoNothing();

  const rows = await db
    .select({ id: linksTable.id, short_code: linksTable.short_code, status: linksTable.status, created_at: linksTable.created_at })
    .from(linksTable)
    .where(and(eq(linksTable.user_id, userId), inArray(linksTable.short_code, codes)));

  const links = new Map(rows.map((r) => [r.short_code, r]));
  return { links, missing: codes.filter((c) => !links.has(c)) };
}

function generateClicks(links, userId) {
  const now = Date.now();
  const rows = [];
  // Disabled links return 410 on redirect and never record a click — exclude
  // them so the demo data stays realistic (and the newest link isn't the
  // most-clicked just because of its age).
  const linkEntries = [...links.values()]
    .filter((l) => l.status === "active")
    .map((l) => ({
      id: l.id,
      createdAt: l.created_at.getTime(),
      weight: 1 / ((now - l.created_at.getTime()) / DAY + 8),
    }));

  // Walk oldest → newest so the recent-surge deltas and the growing trend feel
  // natural, and every click lands on a link that already existed that day.
  // Links are created at exactly (now - N*DAY), which lands on a dayStart, so
  // the cutoff must be createdAt <= dayStart — using dayStart + DAY would let
  // one extra day of clicks through before the link existed.
  for (let d = 89; d >= 0; d--) {
    const dayStart = now - d * DAY;
    const dow = new Date(dayStart).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const base = 16 + rand() * 10;
    const weekendFactor = isWeekend ? 0.65 : 1.25;
    const surge = d <= 6 ? 1.9 : 1; // last 7 days get a traffic bump
    const growth = 0.6 + ((89 - d) / 89) * 0.8; // slow growth over the window
    const count = Math.round(base * weekendFactor * surge * growth);

    const eligible = linkEntries.filter((l) => l.createdAt <= dayStart);
    if (eligible.length === 0) continue;

    for (let i = 0; i < count; i++) {
      const link = pickWeighted(eligible);
      const country = pickWeighted(COUNTRIES);
      const device = pickWeighted(DEVICES);

      // Weight hours toward daytime/evening (9am–9pm).
      const hour = rand() < 0.65 ? 9 + Math.floor(rand() * 13) : Math.floor(rand() * 24);
      const clickedAt = new Date(dayStart + hour * 3600 * 1000 + Math.floor(rand() * 3600 * 1000));

      rows.push({
        link_id: link.id,
        clicked_at: clickedAt,
        country: country.code,
        city: country.cities[Math.floor(rand() * country.cities.length)],
        device_type: device.type,
        browser: pickFrom(device.browsers),
        os: pickFrom(device.os),
        visitor_hash: pickVisitorHash(),
      });
    }
  }
  return rows;
}

async function insertClicks(rows) {
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(clicksTable).values(rows.slice(i, i + BATCH));
  }
}

async function main() {
  const userId = await ensureUser();
  const { links, missing } = await seedLinks(userId);

  if (links.size === 0) {
    console.error("❌ No seed links could be inserted (all short codes taken?).");
    process.exit(1);
  }

  const clicks = generateClicks(links, userId);
  await insertClicks(clicks);

  const unique = new Set(clicks.map((c) => c.visitor_hash)).size;

  console.log(`✅ Seeded ${links.size} links for user ${userId}: ${[...links.keys()].join(", ")}`);
  if (missing.length) console.log(`   Skipped (short code taken by another user): ${missing.join(", ")}`);
  console.log(`✅ Seeded ${clicks.length.toLocaleString()} clicks across the last 90 days (${unique.toLocaleString()} unique visitors).`);
  console.log("   ⏺ Trend: weekday peaks, ~2× surge in the last 7 days → dashboards will show positive deltas.");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
