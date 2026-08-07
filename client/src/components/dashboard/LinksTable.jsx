import { useState } from "react";
import StatusSwitch from "../ui/StatusSwitch";
import { getFavicon, formatRelativeTime } from "../../utils/dashboardUtils";
import { sanitizeShortCode } from "../../utils/format";
import { LuCopy, LuPencil, LuQrCode, LuTrash2 } from "react-icons/lu";

function CopyButton({ shortCode, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await onCopy(shortCode);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="g-op"
      title={copied ? "Copied!" : "Copy link"}
      aria-label={copied ? "Copied!" : "Copy link"}
      onClick={handleClick}
    >
      {copied ? (
        "COPIED"
      ) : (
        <>
          <LuCopy className="w-3 h-3" /> COPY
        </>
      )}
    </button>
  );
}

const SortArrow = ({ field, sortField, sortDir }) => (
  <span className="g-tri" aria-hidden>
    {sortField === field ? (sortDir === "desc" ? "▼" : "▲") : ""}
  </span>
);

const LinksTable = ({
  filteredLinks,
  editingId,
  editUrlValue,
  setEditUrlValue,
  editShortCodeValue,
  setEditShortCodeValue,
  isSavingLink,
  isChangingStatus,
  isDeletingLink,
  handleCancelEdit,
  handleSaveEdit,
  handleEditClick,
  handleDelete,
  handleCopy,
  handleShowQR,
  changeStatus,
  hasActiveFilters,
  clearFilters,
}) => {
  const [sortField, setSortField] = useState("lastClick");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (!sortField) return 0;
    let cmp = 0;
    if (sortField === "views") {
      cmp = (a.views ?? 0) - (b.views ?? 0);
    } else if (sortField === "date") {
      cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortField === "lastClick") {
      cmp = new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0);
    } else if (sortField === "status") {
      cmp = (a.status || "").localeCompare(b.status || "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleToggleStatus = (link) => {
    changeStatus({
      id: link.id,
      status: link.status === "active" ? "disabled" : "active",
    });
  };

  return (
    <div className="hidden lg:block">
      {sortedLinks.length === 0 ? (
        <div className="g-empty">
          <div className="g-empty-glyph">∅</div>
          <h2 className="g-empty-title">No matching links</h2>
          <p className="g-empty-sub">
            {hasActiveFilters
              ? "Nothing matches the current search or filters. Widen the net or clear the filters."
              : "Create your first link to get started."}
          </p>
          {hasActiveFilters && (
            <button
              className="g-btn g-btn-line g-btn-sm"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th className="g-idx g-center">#</th>
                <th>Short Link</th>
                <th>Destination</th>
                <th
                  className="g-right g-sort"
                  onClick={() => toggleSort("views")}
                >
                  Views{" "}
                  <SortArrow
                    field="views"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
                <th className="g-sort" onClick={() => toggleSort("lastClick")}>
                  Last Click{" "}
                  <SortArrow
                    field="lastClick"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
                <th
                  className="g-center g-sort"
                  onClick={() => toggleSort("status")}
                >
                  Status{" "}
                  <SortArrow
                    field="status"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
                <th className="g-sort" onClick={() => toggleSort("date")}>
                  Created{" "}
                  <SortArrow
                    field="date"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
                <th className="g-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.map((link, index) => (
                <tr
                  key={link.id}
                  className={editingId === link.id ? "editing" : ""}
                >
                  <td className="g-idx g-tnum g-center">{index + 1}</td>
                  <td>
                    {editingId === link.id ? (
                      <input
                        type="text"
                        className="g-inline"
                        value={editShortCodeValue}
                        onChange={(e) =>
                          setEditShortCodeValue(
                            sanitizeShortCode(e.target.value),
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(link);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        aria-label="Short code"
                      />
                    ) : (
                      <span className="g-code">{link.short_code}</span>
                    )}
                  </td>
                  {editingId === link.id ? (
                    <td>
                      <input
                        type="text"
                        className="g-inline"
                        value={editUrlValue}
                        onChange={(e) => setEditUrlValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(link);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        aria-label="Destination URL"
                        autoFocus
                      />
                    </td>
                  ) : (
                    <td>
                      <span className="g-dest">
                        {getFavicon(link.original_url) && (
                          <img
                            src={getFavicon(link.original_url)}
                            alt=""
                            loading="lazy"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        )}
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={link.original_url}
                        >
                          {link.original_url}
                        </a>
                      </span>
                    </td>
                  )}
                  <td className="g-right g-tnum">
                    {link.views.toLocaleString()}
                  </td>
                  <td className="g-tnum">
                    {formatRelativeTime(link.last_click_at) ?? "—"}
                  </td>
                  <td className="g-center">
                    <StatusSwitch
                      status={link.status}
                      onChange={() => handleToggleStatus(link)}
                      disabled={isChangingStatus}
                    />
                  </td>
                  <td className="g-tnum">
                    {formatRelativeTime(link.created_at) ?? "—"}
                  </td>
                  <td>
                    {editingId === link.id ? (
                      <div className="g-ops">
                        <button
                          className="g-op g-op-solid"
                          onClick={() => handleSaveEdit(link)}
                          disabled={isSavingLink || isChangingStatus}
                        >
                          {isSavingLink ? "SAVING…" : "SAVE"}
                        </button>
                        <button className="g-op" onClick={handleCancelEdit}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="g-ops">
                        <CopyButton
                          shortCode={link.short_code}
                          onCopy={handleCopy}
                        />
                        <button
                          className="g-op"
                          title="Edit link"
                          onClick={() => handleEditClick(link)}
                        >
                          <LuPencil className="w-3 h-3" /> EDIT
                        </button>
                        <button
                          className="g-op"
                          title="Show QR code"
                          onClick={() => handleShowQR(link)}
                        >
                          <LuQrCode className="w-3 h-3" /> QR
                        </button>
                        <button
                          className="g-op g-op-danger"
                          title="Delete link"
                          onClick={() => handleDelete(link)}
                          disabled={isDeletingLink}
                        >
                          <LuTrash2 className="w-3 h-3" /> DEL
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LinksTable;
