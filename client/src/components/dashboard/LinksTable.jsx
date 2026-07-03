import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/Table";
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

const LinksTable = ({
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
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableHead className="w-1/4">Short URL</TableHead>
          <TableHead className="w-1/3">Original URL</TableHead>
          <TableHead className="w-24">Views</TableHead>
          <TableHead className="w-32">Status</TableHead>
          <TableHead className="w-32">Date</TableHead>
          <TableHead className="w-40 text-right">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {filteredLinks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                No links match your filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-semibold text-gray-900 flex items-center gap-2">
                  {link.short_code}
                  <button
                    className="text-gray-400 hover:text-gray-900"
                    title="Copy to clipboard"
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
                </TableCell>

                {editingId === link.id ? (
                  <TableCell className="w-full max-w-xs">
                    <input
                      type="text"
                      value={editUrlValue}
                      onChange={(e) => setEditUrlValue(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      autoFocus
                    />
                  </TableCell>
                ) : (
                  <TableCell
                    className="w-full max-w-xs truncate text-gray-500"
                    title={link.original_url}
                  >
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 underline underline-offset-2 cursor-pointer"
                    >
                      {link.original_url}
                    </a>
                  </TableCell>
                )}

                <TableCell className="font-mono text-sm">
                  {(link.views ?? 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {editingId === link.id ? (
                    <select
                      value={editStatusValue}
                      onChange={(e) => setEditStatusValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white w-28"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  ) : (
                    <Chip status={link.status}>
                      {link.status === "active" ? "Active" : link.status === "warning" ? "Flagged" : "Disabled"}
                    </Chip>
                  )}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatDate(link.created_at)}
                </TableCell>
                <TableCell className="text-right space-x-2 w-40 min-w-40">
                  {editingId === link.id ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleSaveEdit(link)}
                        disabled={isSavingLink || isChangingStatus}
                        className="px-3 py-1"
                      >
                        {isSavingLink || isChangingStatus ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button
                        className="text-gray-500 hover:text-gray-900 p-1"
                        title="Edit"
                        onClick={() => handleEditClick(link)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-600 p-1"
                        title="Delete Link"
                        onClick={() => handleDelete(link.id)}
                        disabled={isDeletingLink}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LinksTable;
