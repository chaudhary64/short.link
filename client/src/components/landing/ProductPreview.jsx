import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const stats = [
  { label: "Total links", value: "24" },
  { label: "Total clicks", value: "3,482" },
  { label: "Active links", value: "22" },
];

const links = [
  { code: "launch", dest: "example.com/product/launch", clicks: 1284, active: true },
  { code: "guides", dest: "example.com/blog/setup-guide", clicks: 864, active: true },
  { code: "sale", dest: "example.com/checkout/summer", clicks: 412, active: false },
  { code: "github", dest: "github.com/chaudhary64/short.link", clicks: 198, active: true },
];

const maxClicks = Math.max(...links.map((l) => l.clicks));

const topLinks = [
  { code: "launch", pct: 42 },
  { code: "guides", pct: 28 },
  { code: "sale", pct: 13 },
  { code: "github", pct: 6 },
];

const quickActions = [
  { label: "New link", icon: "plus" },
  { label: "QR code", icon: "qr" },
  { label: "Copy", icon: "copy" },
];

const activity = [
  { text: "short.link/launch received 128 clicks", time: "2 minutes ago" },
  { text: "New link short.link/guides created", time: "1 hour ago" },
  { text: "short.link/sale was disabled", time: "3 hours ago" },
];

const actionIcons = {
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  qr: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 14h4v4h-4zM14 18h1M18 14h1" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

const ChainIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ProductPreview = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Product Preview"
          title="Your dashboard, at a glance."
          subtitle="Every link you create lands in a clean dashboard — recent links, click counts, top performers, quick actions, and a live activity feed."
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="bg-white border border-[#E8E8EC] rounded-xl overflow-hidden">
            {/* Address bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-[#F1F1F4]">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8EC]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8EC]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8EC]" />
              </div>
              <div className="flex-1 max-w-md mx-auto bg-[#F6F6F9] border border-[#E8E8EC] rounded-md px-3 py-1 text-[11px] font-mono text-[#6B6B6B] truncate">
                app.short.link/dashboard
              </div>
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] shrink-0">
                Sample data
              </span>
            </div>

            {/* Dashboard body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left column */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* Stat blocks */}
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className="border border-[#E8E8EC] rounded-lg p-3 group/stat transition-colors duration-200 hover:border-[#6366F1]/40"
                    >
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[#9C9C9C] mb-1">
                        {s.label}
                      </p>
                      <p className="text-lg sm:text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                        {s.value}
                      </p>
                      <div className="mt-2 h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6366F1] transition-all duration-500"
                          style={{ width: `${[78, 92, 74][i]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent links table */}
                <div className="border border-[#E8E8EC] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[#F1F1F4]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                      Recent links
                    </span>
                    <span className="text-[11px] font-medium text-[#6366F1]">
                      View all
                    </span>
                  </div>

                  {links.map((link) => (
                    <div
                      key={link.code}
                      className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-[#F1F1F4] last:border-b-0 transition-colors duration-150 hover:bg-[#F6F6F9]"
                    >
                      <span className="w-7 h-7 bg-[#F3F4F6] border border-[#E8E8EC] text-[#0A0A0A] rounded-md flex items-center justify-center shrink-0">
                        <ChainIcon />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-medium text-[#0A0A0A] truncate">
                          short.link/{link.code}
                        </p>
                        <p className="text-[11px] text-[#9C9C9C] truncate hidden sm:block">
                          {link.dest}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-semibold text-[#0A0A0A] tabular-nums">
                          {link.clicks.toLocaleString()}
                        </span>
                        <div className="w-12 h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#6366F1]/70"
                            style={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`shrink-0 w-2 h-2 rounded-full ${
                          link.active ? "bg-[#10B981]" : "bg-[#E8E8EC]"
                        }`}
                        title={link.active ? "Active" : "Disabled"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-5">
                {/* Top performing */}
                <div className="border border-[#E8E8EC] rounded-lg p-3 sm:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-3">
                    Top performing
                  </p>
                  <div className="flex flex-col gap-3">
                    {topLinks.map((t) => (
                      <div key={t.code}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-[#0A0A0A]">
                            /{t.code}
                          </span>
                          <span className="text-[11px] text-[#9C9C9C] tabular-nums">
                            {t.pct}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${t.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full bg-[#6366F1]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="border border-[#E8E8EC] rounded-lg p-3 sm:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-3">
                    Quick actions
                  </p>
                  <div className="flex gap-2">
                    {quickActions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        className="flex-1 flex flex-col items-center gap-1.5 py-2.5 border border-[#E8E8EC] rounded-lg text-[#6B6B6B] transition-colors duration-200 hover:border-[#6366F1]/40 hover:text-[#6366F1] cursor-pointer"
                      >
                        {actionIcons[a.icon]}
                        <span className="text-[11px] font-medium">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="border-t border-[#F1F1F4] px-4 sm:px-6 py-3 flex flex-col gap-1.5">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#10B981]/50 rounded-full shrink-0" />
                  <p className="text-[11px] sm:text-xs text-[#6B6B6B] truncate">
                    {a.text}
                  </p>
                  <span className="ml-auto text-[10px] text-[#9C9C9C] shrink-0">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductPreview;
