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
import {
  LuCheck,
  LuChevronDown,
  LuCopy,
  LuPencil,
  LuQrCode,
  LuSearchX,
  LuTrash2,
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
      className={`p-0.5 rounded transition-all duration-150 cursor-pointer ${
        copied ? "text-[#10B981]" : "text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]"
      }`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      onClick={handleClick}
    >
      {copied ? (
        <LuCheck className="w-3.5 h-3.5" />
      ) : (
        <LuCopy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function SortIndicator({ direction }) {
  if (!direction) return null;
  return (
    <LuChevronDown
      className={`w-3 h-3 ml-0.5 inline-block transition-transform duration-150 ${
        direction === "desc" ? "" : "rotate-180"
      }`}
    />
  );
}

function ActionButton({ icon, title, onClick, variant = "default", disabled = false }) {
  return (
    <button
      className={`w-8 h-8 inline-flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === "danger"
          ? "text-[#6B6B6B] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
          : "text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]"
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
  hasActiveFilters,
  clearFilters,
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
      <Table className="max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
        <TableHeader>
          <TableHead className="w-[22%]">Short URL</TableHead>
          <TableHead className="w-[30%]">Original URL</TableHead>
          <th
            className="px-5 py-3 whitespace-nowrap w-[10%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("views")}
          >
            Views <SortIndicator direction={sortField === "views" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[12%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("status")}
          >
            Status <SortIndicator direction={sortField === "status" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[12%] cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("date")}
          >
            Date <SortIndicator direction={sortField === "date" ? sortDir : null} />
          </th>
          <TableHead className="w-[14%] text-center">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {sortedLinks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <span className="w-11 h-11 bg-[#F3F4F6] text-[#9C9C9C] flex items-center justify-center rounded-lg">
                    <LuSearchX className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">No links found</p>
                    <p className="text-xs text-[#9C9C9C] mt-0.5">
                      {hasActiveFilters
                        ? "Nothing matches your current search or filters."
                        : "Create your first link to get started."}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-mono text-xs font-medium text-[#0A0A0A]">
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(link);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="w-full px-3 py-1.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                      autoFocus
                    />
                  </TableCell>
                ) : (
                  <TableCell
                    className="max-w-xs truncate text-[#6B6B6B]"
                    title={link.original_url}
                  >
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#0A0A0A] underline underline-offset-2 decoration-[#D4D4D8] hover:decoration-[#6B6B6B] transition-colors cursor-pointer"
                    >
                      {link.original_url}
                    </a>
                  </TableCell>
                )}

                <TableCell className="font-mono text-sm text-center tabular-nums">
                  {(link.views ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {editingId === link.id ? (
                    <select
                      value={editStatusValue}
                      onChange={(e) => setEditStatusValue(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white w-28 cursor-pointer"
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
                <TableCell className="text-[#6B6B6B]">
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
                        icon={<LuPencil className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="QR Code"
                        onClick={() => handleShowQR(link)}
                        icon={<LuQrCode className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="Delete"
                        variant="danger"
                        onClick={() => handleDelete(link)}
                        disabled={isDeletingLink}
                        icon={<LuTrash2 className="w-4 h-4" />}
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
