import { useEffect } from "react";
import Button from "./Button";
import { LuLoaderCircle, LuTrash2, LuX } from "react-icons/lu";

const DeleteLinkModal = ({ open, onClose, link, isDeleting, onConfirm }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !link) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm bg-white border border-[#D4D4D8] shadow-2xl rounded-xl overflow-hidden"
        style={{ animation: "sheet-in 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center rounded-lg shrink-0">
              <LuTrash2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A]">Delete link</h3>
              <p className="text-xs text-[#9C9C9C] mt-0.5 font-mono">{link.short_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-[#0A0A0A] leading-relaxed">
            Are you sure you want to delete this link?
          </p>
          <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
            The short URL will stop redirecting immediately and this action
            cannot be undone.
          </p>
          {link.original_url && (
            <p className="mt-3 text-xs text-[#9C9C9C] truncate bg-[#F6F6F9] border border-[#D4D4D8] rounded-md px-3 py-2">
              <span className="text-[#6B6B6B]">Redirects to: </span>
              {link.original_url}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="small"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <LuLoaderCircle className="w-4 h-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete link"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLinkModal;
