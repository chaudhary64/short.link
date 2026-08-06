import { useState } from "react";
import StatusSwitch from "../ui/StatusSwitch";
import { getFavicon, formatRelativeTime } from "../../utils/dashboardUtils";
import { sanitizeShortCode } from "../../utils/format";

const Mark = () => <span className="g-mark" aria-hidden />;

const LinksMobileList = ({
  filteredLinks,
  editingId,
  editUrlValue,
  setEditUrlValue,
  editShortCodeValue,
  setEditShortCodeValue,
  isSavingLink,
  isChangingStatus,
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
  const [copiedCode, setCopiedCode] = useState(null);

  const handleRowCopy = async (link) => {
    const ok = await handleCopy(link.short_code);
    if (ok) {
      setCopiedCode(link.id);
      setTimeout(() => setCopiedCode(null), 1500);
    }
  };

  const handleToggleStatus = (link) => {
    changeStatus({
      id: link.id,
      status: link.status === "active" ? "disabled" : "active",
    });
  };

  return (
    <div className="g-mobile lg:hidden">
      {filteredLinks.length === 0 ? (
        <div className="g-empty">
          <div className="g-empty-glyph">∅</div>
          <h2 className="g-empty-title">No matching links</h2>
          <p className="g-empty-sub">
            {hasActiveFilters
              ? "Nothing matches the current search or filters. Widen the net or clear the filters."
              : "Create your first link to get started."}
          </p>
          {hasActiveFilters && (
            <button className="g-btn g-btn-line g-btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        filteredLinks.map((link) => (
          <article key={link.id} className="g-mcard">
            <Mark />
            {editingId === link.id ? (
              <div className="g-mcard-edit">
                <div>
                  <label className="g-flabel" htmlFor={`edit-url-${link.id}`}>
                    URL
                  </label>
                  <input
                    id={`edit-url-${link.id}`}
                    className="g-input"
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="g-flabel" htmlFor={`edit-code-${link.id}`}>
                    Alias
                  </label>
                  <input
                    id={`edit-code-${link.id}`}
                    className="g-input"
                    type="text"
                    value={editShortCodeValue}
                    onChange={(e) =>
                      setEditShortCodeValue(sanitizeShortCode(e.target.value))
                    }
                    placeholder="alias"
                  />
                </div>
                <div className="g-form-actions">
                  <button className="g-btn g-btn-line g-btn-sm flex-1" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button
                    className="g-btn g-btn-sm flex-1"
                    onClick={() => handleSaveEdit(link)}
                    disabled={isSavingLink}
                  >
                    {isSavingLink ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="g-mcard-top">
                  <span className="g-code flex items-center gap-1.5 min-w-0">
                    {getFavicon(link.original_url) && (
                      <img
                        src={getFavicon(link.original_url)}
                        alt=""
                        loading="lazy"
                        className="w-4 h-4 shrink-0"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <button
                      onClick={() => handleRowCopy(link)}
                      className="g-code bg-none border-none cursor-pointer p-0 text-left truncate"
                      aria-label="Copy short link"
                      title="Copy short link"
                    >
                      {link.short_code}
                    </button>
                  </span>
                  <StatusSwitch
                    status={link.status}
                    onChange={() => handleToggleStatus(link)}
                    disabled={isChangingStatus}
                  />
                </div>
                <a
                  className="g-mcard-url"
                  href={link.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.original_url}
                >
                  {link.original_url}
                </a>
                <div className="g-mcard-meta">
                  <span>{link.views.toLocaleString()} VIEWS</span>
                  <span>CREATED {formatRelativeTime(link.created_at) ?? "—"}</span>
                </div>
                <div className="g-mcard-ops">
                  <button className="g-op" onClick={() => handleRowCopy(link)}>
                    {copiedCode === link.id ? "COPIED" : "COPY"}
                  </button>
                  <button className="g-op" onClick={() => handleEditClick(link)}>
                    EDIT
                  </button>
                  <button className="g-op" onClick={() => handleShowQR(link)}>
                    QR
                  </button>
                  <button className="g-op g-op-danger" onClick={() => handleDelete(link)}>
                    DEL
                  </button>
                </div>
              </>
            )}
          </article>
        ))
      )}
    </div>
  );
};

export default LinksMobileList;
