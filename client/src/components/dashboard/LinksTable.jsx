import { useState } from "react";
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

function CopyButton({ shortCode, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`p-0.5 rounded transition-all duration-150 cursor-pointer ${
        copied ? "text-[#10b981]" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
      }`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      onClick={handleClick}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

function SortIndicator({ direction }) {
  if (!direction) return null;
  return (
    <svg
      className={`w-3 h-3 ml-0.5 inline-block transition-transform duration-150 ${
        direction === "desc" ? "" : "rotate-180"
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ActionButton({ icon, title, onClick, variant = "default", disabled = false }) {
  return (
    <button
      className={`w-8 h-8 inline-flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === "danger"
          ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

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
  handleShowQR,
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (!sortField) return 0;
    let cmp = 0;
    if (sortField === "views") {
      cmp = (a.views ?? 0) - (b.views ?? 0);
    } else if (sortField === "date") {
      cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortField === "status") {
      cmp = (a.status || "").localeCompare(b.status || "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableHead className="w-[22%]">Short URL</TableHead>
          <TableHead className="w-[30%]">Original URL</TableHead>
          <th
            className="px-5 py-3 whitespace-nowrap w-[10%] text-center cursor-pointer select-none hover:text-gray-900 transition-colors"
            onClick={() => toggleSort("views")}
          >
            Views <SortIndicator direction={sortField === "views" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[12%] text-center cursor-pointer select-none hover:text-gray-900 transition-colors"
            onClick={() => toggleSort("status")}
          >
            Status <SortIndicator direction={sortField === "status" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[12%] cursor-pointer select-none hover:text-gray-900 transition-colors"
            onClick={() => toggleSort("date")}
          >
            Date <SortIndicator direction={sortField === "date" ? sortDir : null} />
          </th>
          <TableHead className="w-[14%] text-center">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {sortedLinks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                No links match your filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-semibold text-gray-900">
                  <span className="inline-flex items-center gap-1.5">
                    {link.short_code}
                    <CopyButton shortCode={link.short_code} onCopy={handleCopy} />
                  </span>
                </TableCell>

                {editingId === link.id ? (
                  <TableCell className="max-w-xs">
                    <input
                      type="text"
                      value={editUrlValue}
                      onChange={(e) => setEditUrlValue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                      autoFocus
                    />
                  </TableCell>
                ) : (
                  <TableCell
                    className="max-w-xs truncate text-gray-500"
                    title={link.original_url}
                  >
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-600 transition-colors cursor-pointer"
                    >
                      {link.original_url}
                    </a>
                  </TableCell>
                )}

                <TableCell className="font-mono text-sm text-center">
                  {(link.views ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === link.id ? (
                    <select
                      value={editStatusValue}
                      onChange={(e) => setEditStatusValue(e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white w-28"
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
                <TableCell>
                  {editingId === link.id ? (
                    <div className="flex gap-1.5 justify-center">
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
                    <div className="flex items-center justify-center gap-0.5">
                      <ActionButton
                        title="Edit"
                        onClick={() => handleEditClick(link)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        }
                      />
                      <ActionButton
                        title="QR Code"
                        onClick={() => handleShowQR(link)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        }
                      />
                      <ActionButton
                        title="Delete"
                        variant="danger"
                        onClick={() => handleDelete(link.id)}
                        disabled={isDeletingLink}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      />
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
