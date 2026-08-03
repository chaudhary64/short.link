import { useState } from "react";
import { createPortal } from "react-dom";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import useDragToDismiss from "../../hooks/useDragToDismiss";
import { getFavicon } from "../../utils/dashboardUtils";
import { formatFullTimestamp, formatModified, sanitizeShortCode, shortLinkHost } from "../../utils/format";
import {
  LuCheck,
  LuCopy,
  LuEllipsisVertical,
  LuEye,
  LuLink,
  LuPencil,
  LuQrCode,
  LuSearchX,
  LuTrash2,
  LuX,
} from "react-icons/lu";

function ActionSheet({ open, onClose, onEdit, onDelete, onCopy, onShowQR, shortCode }) {
  const { ref: sheetRef, style: sheetDragStyle } = useDragToDismiss({
    open,
    onClose,
  });

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="relative w-full sm:max-w-xs bg-white border border-[#D4D4D8] shadow-xl rounded-t-xl sm:rounded-xl overflow-hidden"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)", ...sheetDragStyle }}
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#D4D4D8]" />
        </div>
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
            <LuCopy className="w-4 h-4 text-[#10B981]" />
            Copy Link
          </button>
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuPencil className="w-4 h-4 text-[#F59E0B]" />
            Edit Link
          </button>
          <button
            onClick={() => { onShowQR(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuQrCode className="w-4 h-4 text-[#8B5CF6]" />
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
    </div>,
    document.body,
  );
}

const LinksMobileList = ({
  filteredLinks,
  editingId,
  editUrlValue,
  setEditUrlValue,
  editShortCodeValue,
  setEditShortCodeValue,
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
  const [copiedCode, setCopiedCode] = useState(null);

  const handleRowCopy = async (link) => {
    const ok = await handleCopy(link.short_code);
    if (ok) {
      setCopiedCode(link.id);
      setTimeout(() => setCopiedCode(null), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:hidden">
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
          <div key={link.id} className="bg-white border border-[#D4D4D8] rounded-xl overflow-hidden">
            {editingId === link.id ? (
              <div className="p-4 flex flex-col gap-2">
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
                    Alias
                  </label>
                  <div className="flex items-center rounded-md border border-[#D4D4D8] bg-white focus-within:border-[#6366F1] focus-within:ring-[3px] focus-within:ring-[#6366F1]/12 px-3 transition-all">
                    <span className="text-xs font-mono text-[#9C9C9C] whitespace-nowrap shrink-0">
                      {shortLinkHost()}/
                    </span>
                    <input
                      type="text"
                      value={editShortCodeValue}
                      onChange={(e) =>
                        setEditShortCodeValue(sanitizeShortCode(e.target.value))
                      }
                      className="w-full py-2 pl-1.5 text-sm text-[#0A0A0A] bg-transparent focus:outline-none placeholder:text-[#9C9C9C]"
                    />
                  </div>
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
              <>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E5E5EA] flex items-center justify-center shrink-0 overflow-hidden">
                    {getFavicon(link.original_url) ? (
                      <img
                        src={getFavicon(link.original_url)}
                        alt=""
                        loading="lazy"
                        className="w-5 h-5 rounded-[4px]"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <LuLink className="w-4 h-4 text-[#9C9C9C]" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <button
                      onClick={() => handleRowCopy(link)}
                      className="flex items-center gap-1.5 min-w-0 text-left cursor-pointer"
                      aria-label="Copy short link"
                    >
                      <span className="font-mono text-sm font-semibold text-[#0A0A0A] truncate">
                        {link.short_code}
                      </span>
                      {copiedCode === link.id ? (
                        <LuCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                      ) : (
                        <LuCopy className="w-3.5 h-3.5 text-[#9C9C9C] shrink-0" />
                      )}
                    </button>
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.original_url}
                      className="text-xs text-[#6B6B6B] truncate hover:text-[#0A0A0A] cursor-pointer"
                    >
                      {link.original_url}
                    </a>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-xs text-[#9C9C9C]">
                    <LuEye className="w-3.5 h-3.5" />
                    <span className="tabular-nums font-medium text-[#0A0A0A]">
                      {(link.views ?? 0).toLocaleString()}
                    </span>
                  </span>
                  <button
                    onClick={() => setSheetOpen(link)}
                    className="p-1.5 -ml-1 text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer shrink-0"
                    aria-label="More actions"
                  >
                    <LuEllipsisVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-[#E5E5EA] bg-[#FAFAFA] text-xs text-[#9C9C9C]">
                  <span className="min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-center gap-1">
                      <span className="text-[#6B6B6B] shrink-0">Created</span>
                      <span className="truncate">
                        {formatFullTimestamp(link.created_at)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#6B6B6B] shrink-0">Modified</span>
                      <span className="truncate">
                        {formatModified(link.created_at, link.updated_at)}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0">
                    <Chip status={link.status}>
                      {link.status === "active" ? "Active" : "Disabled"}
                    </Chip>
                  </span>
                </div>
              </>
            )}
          </div>
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
