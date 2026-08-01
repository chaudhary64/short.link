import { useState } from "react";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import {
  LuCheck,
  LuCopy,
  LuEllipsisVertical,
  LuPencil,
  LuQrCode,
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

  const handleClick = () => {
    onCopy(shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`p-1 transition-all duration-150 cursor-pointer ${
        copied ? "text-[#10b981]" : "text-gray-400 hover:text-gray-900"
      }`}
      title={copied ? "Copied!" : "Copy"}
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
        className="relative w-full sm:max-w-xs bg-white border border-gray-200 shadow-xl sm:rounded-xl overflow-hidden"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{shortCode}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <LuX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 flex flex-col">
          <button
            onClick={() => { onCopy(shortCode); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuCopy className="w-4 h-4 text-gray-400" />
            Copy Link
          </button>
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuPencil className="w-4 h-4 text-gray-400" />
            Edit Link
          </button>
          <button
            onClick={() => { onShowQR(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuQrCode className="w-4 h-4 text-gray-400" />
            QR Code
          </button>
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LuTrash2 className="w-4 h-4 text-red-400" />
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
}) => {
  const [sheetOpen, setSheetOpen] = useState(null);

  return (
    <div className="flex flex-col gap-4 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200">
          No links match your filters.
        </div>
      ) : (
        filteredLinks.map((link) => (
          <Card key={link.id} className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  {link.short_code}
                  <CopyButton shortCode={link.short_code} onCopy={handleCopy} />
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  {formatDate(link.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Chip status={link.status}>
                  {link.status === "active" ? "Active" : "Disabled"}
                </Chip>
                <button
                  onClick={() => setSheetOpen(link)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="More actions"
                >
                  <LuEllipsisVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingId === link.id ? (
              <div className="w-full flex flex-col gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Original URL
                  </label>
                  <input
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Status
                  </label>
                  <select
                    value={editStatusValue}
                    onChange={(e) => setEditStatusValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white"
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
                    {isSavingLink || isChangingStatus ? "Saving…" : "Save"}
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
                  className="text-sm text-gray-700 truncate block hover:text-gray-900 underline underline-offset-2 cursor-pointer"
                  title={link.original_url}
                >
                  {link.original_url}
                </a>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                <strong className="text-gray-900">
                  {(link.views ?? 0).toLocaleString()}
                </strong>{" "}
                views
              </span>
              {editingId !== link.id && (
                <span className="text-xs text-gray-400">
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
        onDelete={() => handleDelete(sheetOpen?.id)}
        onCopy={handleCopy}
        onShowQR={() => handleShowQR(sheetOpen)}
      />
    </div>
  );
};

export default LinksMobileList;
