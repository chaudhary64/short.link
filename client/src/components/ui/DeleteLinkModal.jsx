import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="g-modal-overlay">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className="g-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label="Delete link"
        style={{ width: 360 }}
      >
        <button className="g-modal-close" onClick={onClose} aria-label="Close">
          <LuX className="w-4 h-4" />
        </button>

        <div className="g-modal-head pr-8">
          <div>
            <h3 className="g-modal-title flex items-center gap-2">
              <LuTrash2 className="w-5 h-5 text-[#d62828]" aria-hidden />
              Delete link
            </h3>
            <p className="g-modal-code">{link.short_code}</p>
          </div>
        </div>

        <p className="g-modal-sub">
          Are you sure you want to delete this link? The short URL will stop
          redirecting immediately and this action cannot be undone.
        </p>

        {link.original_url && (
          <p className="g-modal-sub border border-[#141414] px-3 py-2 truncate">
            <span className="text-[#141414] font-bold">Redirects to: </span>
            {link.original_url}
          </p>
        )}

        <div className="g-modal-actions">
          <button className="g-btn g-btn-line g-btn-sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="g-btn g-btn-red g-btn-sm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <LuLoaderCircle className="w-4 h-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete link"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteLinkModal;
