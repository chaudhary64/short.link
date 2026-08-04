import { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/Table";
import Button from "../ui/Button";
import StatusSwitch from "../ui/StatusSwitch";
import { getFavicon, formatRelativeTime } from "../../utils/dashboardUtils";
import { sanitizeShortCode, shortLinkHost } from "../../utils/format";
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

function CopyButton({ shortCode, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await onCopy(shortCode);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-[#10B981] text-white border-[#10B981]"
          : "text-[#10B981] border-[#D4D4D8] hover:bg-[#10B981] hover:text-white hover:border-[#10B981]"
      }`}
      title={copied ? "Copied!" : "Copy link"}
      aria-label={copied ? "Copied!" : "Copy link"}
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

const actionColors = {
  default: "text-[#6B6B6B] border-[#D4D4D8] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]",
  copy: "text-[#10B981] border-[#D4D4D8] hover:bg-[#10B981] hover:text-white hover:border-[#10B981]",
  edit: "text-[#F59E0B] border-[#D4D4D8] hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B]",
  qr: "text-[#8B5CF6] border-[#D4D4D8] hover:bg-[#8B5CF6] hover:text-white hover:border-[#8B5CF6]",
  danger: "text-[#EF4444] border-[#D4D4D8] hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444]",
};

function ActionButton({ icon, title, onClick, color = "default", disabled = false }) {
  return (
    <button
      className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        actionColors[color] ?? actionColors.default
      }`}
      title={title}
      aria-label={title}
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
  editShortCodeValue,
  setEditShortCodeValue,
  isSavingLink,
  isChangingStatus,
  isDeletingLink,
  handleCancelEdit,
  handleSaveEdit,
  handleEditClick,
  handleDelete,
  handleCopy,
  handleShowQR,
  changeStatus,
  hasActiveFilters,
  clearFilters,
}) => {
  const [sortField, setSortField] = useState("lastClick");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
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

  const handleToggleStatus = (link) => {
    changeStatus({
      id: link.id,
      status: link.status === "active" ? "disabled" : "active",
    });
  };

  return (
    <div className="hidden lg:block">
      {sortedLinks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-16 px-6 border border-dashed border-[#C1C1C9] bg-white/60 rounded-2xl">
          <span className="w-12 h-12 bg-[#F3F4F6] text-[#6B6B6B] flex items-center justify-center rounded-lg">
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
          <TableHead className="w-[5%]">S. No</TableHead>
          <TableHead className="w-[9%]">Short link</TableHead>
          <TableHead className="w-[32%]">Destination</TableHead>
          <th
            className="px-5 py-3 whitespace-nowrap w-[9%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("views")}
          >
            Views <SortIndicator direction={sortField === "views" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[10%] cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("lastClick")}
          >
            Last click <SortIndicator direction={sortField === "lastClick" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[12%] text-center cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("status")}
          >
            Status <SortIndicator direction={sortField === "status" ? sortDir : null} />
          </th>
          <th
            className="px-5 py-3 whitespace-nowrap w-[9%] cursor-pointer select-none hover:text-[#0A0A0A] transition-colors"
            onClick={() => toggleSort("date")}
          >
            Created <SortIndicator direction={sortField === "date" ? sortDir : null} />
          </th>
          <TableHead className="w-[16%] text-center">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {sortedLinks.map((link, index) => (
              <TableRow key={link.id} className="divide-x divide-[#E5E5EA]">
                <TableCell className="text-[#9C9C9C] tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="font-mono text-xs font-medium text-[#0A0A0A]">
                  {editingId === link.id ? (
                    <div className="flex items-center gap-1.5 rounded-md border border-[#D4D4D8] bg-white focus-within:border-[#6366F1] focus-within:ring-[3px] focus-within:ring-[#6366F1]/12 px-2.5 transition-all">
                      <span className="text-[11px] font-sans text-[#6B6B6B] whitespace-nowrap shrink-0">
                        {shortLinkHost()}/
                      </span>
                      <input
                        type="text"
                        value={editShortCodeValue}
                        onChange={(e) =>
                          setEditShortCodeValue(sanitizeShortCode(e.target.value))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(link);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="w-full py-1.5 text-xs font-mono text-[#0A0A0A] bg-transparent focus:outline-none"
                      />
                    </div>
                  ) : (
                    link.short_code
                  )}
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
                    <LuEye className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    <span className="font-mono">{(link.views ?? 0).toLocaleString()}</span>
                  </span>
                </TableCell>
                <TableCell className="text-[#6B6B6B]">
                  {formatRelativeTime(link.last_click_at) ?? (
                    <span className="text-[#6B6B6B]">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusSwitch
                    status={link.status}
                    onChange={() => handleToggleStatus(link)}
                    disabled={isChangingStatus}
                  />
                </TableCell>
                <TableCell className="text-[#6B6B6B]">
                  {formatRelativeTime(link.created_at) ?? (
                    <span className="text-[#6B6B6B]">—</span>
                  )}
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
                        {isSavingLink ? "Saving…" : "Save changes"}
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
                    <div className="flex items-center justify-center gap-1.5">
                      <CopyButton shortCode={link.short_code} onCopy={handleCopy} />
                      <ActionButton
                        title="Edit link"
                        color="edit"
                        onClick={() => handleEditClick(link)}
                        icon={<LuPencil className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="Show QR code"
                        color="qr"
                        onClick={() => handleShowQR(link)}
                        icon={<LuQrCode className="w-4 h-4" />}
                      />
                      <ActionButton
                        title="Delete link"
                        color="danger"
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
