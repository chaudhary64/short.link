import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuDownload, LuPlus, LuRotateCw } from "react-icons/lu";
import { createLink, getAllLinks } from "../api/links";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";
import { isTypingTarget } from "../utils/keyboard";
import LinkManagement from "../components/dashboard/LinkManagement";
import CreateLinkSheet from "../components/links/CreateLinkSheet";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";
import { SHORTLINK_BASE_URL } from "../config/urls";

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const exportLinksCsv = (links) => {
  const header = [
    "short_code",
    "short_url",
    "destination",
    "status",
    "clicks",
    "created_at",
    "last_click_at",
  ];
  const base = SHORTLINK_BASE_URL;
  const rows = links.map((link) => [
    link.short_code,
    `${base}/${link.short_code}`,
    link.original_url,
    link.status,
    link.views ?? 0,
    link.created_at,
    link.last_click_at ?? "",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `short-link-links-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const LinksPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const accessToken = useAuthToken();
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(params.get("create") === "1");
  const searchQuery = params.get("q") ?? "";

  const {
    data: linkInfo,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
    retry: 1,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const links = linkInfo?.data?.links ?? [];

  useEffect(() => {
    if (params.get("create") === "1") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setCreateOpen(true);
      const next = new URLSearchParams(params);
      next.delete("create");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key.toLowerCase() !== "n" || event.metaKey || event.ctrlKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setCreateOpen(true);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const { mutate: createNewLink, isPending: isCreatingLink } = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      toast.success("Link created", "It is live and tracking clicks.");
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
      queryClient.invalidateQueries({ queryKey: ["OVERVIEW"] });
      queryClient.invalidateQueries({ queryKey: ["OVERVIEW_TOP_LINKS"] });
      setCreateOpen(false);
    },
    onError: (err) => {
      toast.error(
        "Creation failed",
        err.response?.data?.message || "Check the destination URL and try again.",
      );
    },
  });

  const activeCount = links.filter((link) => link.status === "active").length;
  const pausedCount = links.length - activeCount;

  const setSearch = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="page-eyebrow">Inventory</div>
          <h1 className="page-title">Links</h1>
          <p className="page-desc">
            {isLoading
              ? "Loading your links…"
              : `${links.length} ${
                  links.length === 1 ? "link" : "links"
                } · ${activeCount} live · ${pausedCount} paused`}
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm"
            onClick={() => exportLinksCsv(links)}
            disabled={!links.length}
          >
            <LuDownload className="w-3.5 h-3.5" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            className="ui-btn ui-btn--sm"
            onClick={() => setCreateOpen(true)}
          >
            <LuPlus className="w-3.5 h-3.5" aria-hidden />
            New link
          </button>
        </div>
      </header>

      {isError && (
        <div className="empty" role="alert">
          <div className="empty-glyph">!</div>
          <h2 className="empty-title">Could not load your links</h2>
          <p className="empty-sub">
            {error?.response?.data?.message ||
              "The request failed before it reached your workspace."}
          </p>
          <div className="empty-actions">
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <LuRotateCw className="w-3 h-3" aria-hidden />
              {isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        </div>
      )}

      {!isError && isLoading && (
        <div className="g-table-wrap" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 90px 90px",
                gap: 16,
                padding: "14px 16px",
                borderTop: row ? "1px solid var(--line)" : 0,
              }}
            >
              {[0, 1, 2, 3].map((cell) => (
                <div
                  key={cell}
                  className="skeleton"
                  style={{ height: 12, width: cell === 1 ? "70%" : "55%" }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {!isError && !isLoading && links.length === 0 && (
        <div className="empty">
          <div className="empty-glyph">+</div>
          <h2 className="empty-title">No links yet</h2>
          <p className="empty-sub">
            A short link is a permanent address you can pause, retarget and
            measure. Nothing appears here until you create one.
          </p>
          <div className="empty-actions">
            <button
              type="button"
              className="ui-btn ui-btn--sm"
              onClick={() => setCreateOpen(true)}
            >
              <LuPlus className="w-3.5 h-3.5" aria-hidden />
              Create a link
            </button>
          </div>
        </div>
      )}

      {!isError && !isLoading && links.length > 0 && (
        <LinkManagement
          links={links}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
        />
      )}

      <CreateLinkSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createNewLink}
        isCreating={isCreatingLink}
      />
    </div>
  );
};

export default LinksPage;
