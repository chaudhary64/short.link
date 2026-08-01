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
import { getFavicon, formatRelativeTime } from "../../utils/dashboardUtils";
import {
  LuCheck,
  LuChevronDown,
  LuCopy,
  LuEye,
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
      setSortDir(field === "lastClick" ? "desc" : "asc");
    }
  };

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (!sortField) return 0;
    let cmp = 0;
    if (sortField === "views") {
      cmp = (a.views ?? 0) - (b.views ?? 0);
    } else if (sortField === "date") {
      cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortField === "lastClick") {
      cmp = new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0);
    } else if (sortField === "status") {
      cmp = (a.status || "").localeCompare(b.status || "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="hidden lg:block">
      {sortedLinks.length === 0 ? (
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
        <Table className="max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
          <TableHeader className="divide-x divide-[#E5E5EA]">
          <TableHead className="w-[7%]">S. No</TableHead>
          <TableHead className="w-[13%]">Short link</TableHead>
          <TableHead className="w-[28%]">Destination</TableHead>
          <th
            className="px-5 py-3 whitespace-nowrap w-[8%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("views")}
          >
            Views <SortIndicator direction={sortField === "views" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[11%] cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("lastClick")}
          >
            Last click <SortIndicator direction={sortField === "lastClick" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[10%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("status")}
          >
            Status <SortIndicator direction={sortField === "status" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[10%] cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("date")}
          >
            Created <SortIndicator direction={sortField === "date" ? sortDir : null} />
          </th>
          <TableHead className="w-[13%] text-center">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {sortedLinks.map((link, index) => (
              <TableRow key={link.id} className="divide-x divide-[#E5E5EA]">
                <TableCell className="text-sm text-[#9C9C9C] tabular-nums">
                  {index + 1}
                </TableCell>
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
                <TableCell className="max-w-xs text-[#6B6B6B]">
                  <span className="flex items-center gap-2 min-w-0">
                    {getFavicon(link.original_url) && (
                      <img
                        src={getFavicon(link.original_url)}
                        alt=""
                        loading="lazy"
                        className="w-4 h-4 rounded-[4px] shrink-0"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.original_url}
                      className="hover:text-[#0A0A0A] underline underline-offset-2 decoration-[#D4D4D8] hover:decoration-[#6B6B6B] transition-colors cursor-pointer truncate"
                    >
                      {link.original_url}
                    </a>
                  </span>
                </TableCell>
                )}

                <TableCell className="text-center tabular-nums">
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#0A0A0A]">
                    <LuEye className="w-3.5 h-3.5 text-[#9C9C9C]" />
                    <span className="font-mono">{(link.views ?? 0).toLocaleString()}</span>
                  </span>
                </TableCell>
                <TableCell className="text-[#6B6B6B]">
                  {formatRelativeTime(link.last_click_at) ?? (
                    <span className="text-[#9C9C9C]">—</span>
                  )}
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
                        {isSavingLink || isChangingStatus ? "Saving…" : "Save changes"}
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
                        title="Edit link"
                        onClick={() => handleEditClick(link)}
                        icon={<LuPencil className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="Show QR code"
                        onClick={() => handleShowQR(link)}
                        icon={<LuQrCode className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="Delete link"
                        variant="danger"
                        onClick={() => handleDelete(link)}
                        disabled={isDeletingLink}
                        icon={<LuTrash2 className="w-4 h-4" />}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default LinksTable;
