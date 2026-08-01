import { useState } from "react";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import { getFavicon } from "../../utils/dashboardUtils";
import {
  LuCheck,
  LuCopy,
  LuEllipsisVertical,
  LuEye,
  LuPencil,
  LuQrCode,
  LuSearchX,
  LuTrash2,
  LuX,
} from "react-icons/lu";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : "—";

function CopyButton({ shortCode, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await onCopy(shortCode);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`p-1 transition-all duration-150 cursor-pointer ${
        copied ? "text-[#10B981]" : "text-[#9C9C9C] hover:text-[#0A0A0A]"
      }`}
      title={copied ? "Copied!" : "Copy link"}
      onClick={handleClick}
    >
      {copied ? (
        <LuCheck className="w-4 h-4" />
      ) : (
        <LuCopy className="w-4 h-4" />
      )}
    </button>
  );
}

function ActionSheet({ open, onClose, onEdit, onDelete, onCopy, onShowQR, shortCode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-xs bg-white border border-[#D4D4D8] shadow-xl sm:rounded-xl overflow-hidden"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
      >
        <div className="px-4 py-3 border-b border-[#E5E5EA] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0A0A0A]">{shortCode}</span>
          <button onClick={onClose} className="text-[#9C9C9C] hover:text-[#0A0A0A] p-1 cursor-pointer">
            <LuX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 flex flex-col">
          <button
            onClick={() => { onCopy(shortCode); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuCopy className="w-4 h-4 text-[#9C9C9C]" />
            Copy Link
          </button>
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuPencil className="w-4 h-4 text-[#9C9C9C]" />
            Edit Link
          </button>
          <button
            onClick={() => { onShowQR(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuQrCode className="w-4 h-4 text-[#9C9C9C]" />
            Show QR code
          </button>
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuTrash2 className="w-4 h-4 text-[#EF4444]" />
            Delete Link
          </button>
        </div>
      </div>
    </div>
  );
}

const LinksMobileList = ({
  filteredLinks,
  editingId,
  editUrlValue,
  setEditUrlValue,
  editStatusValue,
  setEditStatusValue,
  isSavingLink,
  isChangingStatus,
  handleCancelEdit,
  handleSaveEdit,
  handleEditClick,
  handleDelete,
  handleCopy,
  handleShowQR,
  hasActiveFilters,
  clearFilters,
}) => {
  const [sheetOpen, setSheetOpen] = useState(null);

  return (
    <div className="flex flex-col gap-4 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
      {filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-16 px-6 border border-dashed border-[#C1C1C9] bg-white/60 rounded-2xl">
          <span className="w-12 h-12 bg-[#F3F4F6] text-[#9C9C9C] flex items-center justify-center rounded-lg">
            <LuSearchX className="w-6 h-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#0A0A0A]">No matching links</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5 max-w-sm">
              {hasActiveFilters
                ? "Nothing matches your current search or filters. Try a different keyword or clear the filters to see all links."
                : "Create your first link to get started."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="secondary" size="small" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        filteredLinks.map((link) => (
          <Card key={link.id} className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-mono text-xs font-medium text-[#0A0A0A] flex items-center gap-2">
                  {link.short_code}
                  <CopyButton shortCode={link.short_code} onCopy={handleCopy} />
                </span>
                <span className="text-sm text-[#6B6B6B] mt-1">
                  {formatDate(link.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Chip status={link.status}>
                  {link.status === "active" ? "Active" : "Disabled"}
                </Chip>
                <button
                  onClick={() => setSheetOpen(link)}
                  className="p-1.5 text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                  aria-label="More actions"
                >
                  <LuEllipsisVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingId === link.id ? (
              <div className="w-full flex flex-col gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-1 block">
                    Original URL
                  </label>
                  <input
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-1 block">
                    Status
                  </label>
                  <select
                    value={editStatusValue}
                    onChange={(e) => setEditStatusValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleSaveEdit(link)}
                    disabled={isSavingLink || isChangingStatus}
                    className="flex-1"
                  >
                    {isSavingLink || isChangingStatus ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                  Original URL
                </label>
                <a
                  href={link.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0A0A0A] truncate block hover:text-[#0A0A0A] underline underline-offset-2 decoration-[#D4D4D8] hover:decoration-[#6B6B6B] cursor-pointer flex items-center gap-2"
                  title={link.original_url}
                >
                  {getFavicon(link.original_url) && (
                    <img
                      src={getFavicon(link.original_url)}
                      alt=""
                      loading="lazy"
                      className="w-4 h-4 rounded-[4px] shrink-0"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <span className="truncate min-w-0">{link.original_url}</span>
                </a>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#E5E5EA]">
              <span className="text-sm font-medium text-[#6B6B6B] flex items-center gap-1.5">
                <LuEye className="w-4 h-4 text-[#9C9C9C]" />
                <strong className="text-[#0A0A0A] tabular-nums">
                  {(link.views ?? 0).toLocaleString()}
                </strong>{" "}
                views
              </span>
              {editingId !== link.id && (
                <span className="text-xs text-[#9C9C9C]">
                  Tap <span className="inline-block w-4 h-4 align-middle text-center leading-none">⋮</span> for actions
                </span>
              )}
            </div>
          </Card>
        ))
      )}

      <ActionSheet
        open={!!sheetOpen}
        onClose={() => setSheetOpen(null)}
        shortCode={sheetOpen?.short_code || ""}
        onEdit={() => handleEditClick(sheetOpen)}
        onDelete={() => handleDelete(sheetOpen)}
        onCopy={handleCopy}
        onShowQR={() => handleShowQR(sheetOpen)}
      />
    </div>
  );
};

export default LinksMobileList;
