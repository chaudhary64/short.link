import { LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import ModalSheet from "./ModalSheet";

const DeleteLinkModal = ({ open, onClose, link, isDeleting, onConfirm }) => {
  if (!open || !link) return null;

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabel="Delete link"
      role="alertdialog"
      header={
        <div>
          <h3 className="g-modal-title flex items-center gap-2">
            <LuTrash2 className="w-5 h-5 text-[#d62828]" aria-hidden />
            Delete link
          </h3>
          <p className="g-modal-code">{link.short_code}</p>
        </div>
      }
      footer={
        <>
          <button
            className="g-btn g-btn-line g-btn-sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="g-btn g-btn-red g-btn-sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <LuLoaderCircle className="w-4 h-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete link"
            )}
          </button>
        </>
      }
    >
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
    </ModalSheet>
  );
};

export default DeleteLinkModal;
