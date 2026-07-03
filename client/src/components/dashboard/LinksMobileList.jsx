import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Button from "../ui/Button";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : "—";

const LinksMobileList = ({
  filteredLinks,
  editingId,
  editUrlValue,
  setEditUrlValue,
  editStatusValue,
  setEditStatusValue,
  isSavingLink,
  isChangingStatus,
  isDeletingLink,
  handleCancelEdit,
  handleSaveEdit,
  handleEditClick,
  handleDelete,
  handleCopy,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:hidden">
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
                  <button
                    className="text-gray-400 hover:text-gray-900"
                    title="Copy"
                    onClick={() => handleCopy(link.short_code)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  {formatDate(link.created_at)}
                </span>
              </div>
              <Chip status={link.status}>
                {link.status === "active" ? "Active" : "Disabled"}
              </Chip>
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
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
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
              <div className="flex gap-2">
                {editingId === link.id ? (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleCancelEdit}
                      className="px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleSaveEdit(link)}
                      disabled={isSavingLink || isChangingStatus}
                      className="px-3"
                    >
                      {isSavingLink || isChangingStatus ? "Saving…" : "Save"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleEditClick(link)}
                      className="px-3"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleDelete(link.id)}
                      disabled={isDeletingLink}
                      className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default LinksMobileList;
