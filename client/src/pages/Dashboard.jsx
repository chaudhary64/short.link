import { useState, useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import Avatar from "../components/ui/Avatar";
import StatCard from "../components/ui/StatCard";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../components/ui/Table";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLinks, updateLink, updateLinkStatus, deleteLink, createLink } from "../api/links";
import { updateUser } from "../api/auth";
import { useToast } from "../features/toast/useToast.jsx";

const Dashboard = () => {
  const { name, email, created_at } = useUserInfo();
  const { setUserInfo } = useUserActions();
  const accessToken = useAuthToken();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: linkInfo } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: updateUser,
    onMutate: ({ name: newName }) => {
      const previousName = name;
      setUserInfo({ name: newName, email, created_at });
      return { previousName };
    },
    onError: (_err, _vars, context) => {
      setUserInfo({ name: context.previousName, email, created_at });
    },
    onSuccess: (res) => {
      const serverName = res?.data?.user?.name ?? name;
      setUserInfo({ name: serverName, email, created_at });
    },
  });

  const links = linkInfo?.data?.links ?? [];

  const totalViews = links.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const activeCount = links.filter((l) => l.status === "active").length;
  const disabledCount = links.length - activeCount;

  // Links created in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const createdThisWeek = links.filter(
    (l) => l.created_at && new Date(l.created_at) >= oneWeekAgo,
  ).length;
  const viewsThisWeek = links
    .filter((l) => l.created_at && new Date(l.created_at) >= oneWeekAgo)
    .reduce((sum, l) => sum + (l.views ?? 0), 0);

  const linksDelta =
    createdThisWeek === 0
      ? "None created this week"
      : `+${createdThisWeek} created this week`;

  const viewsDelta =
    viewsThisWeek === 0
      ? "None from this week's links"
      : `+${viewsThisWeek.toLocaleString()} from this week`;

  const activeDescription =
    disabledCount === 0 ? "All links active" : `${disabledCount} disabled`;

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const stats = [
    {
      title: "Total Links",
      value: links.length.toString(),
      description: linksDelta,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          ></path>
        </svg>
      ),
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      description: viewsDelta,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Active Links",
      value: activeCount.toString(),
      description: activeDescription,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      ),
    },
  ];

  const [editingId, setEditingId] = useState(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "disabled"
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  // Derived: apply search + status filter
  const filteredLinks = links.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.short_code?.toLowerCase().includes(q) ||
      l.original_url?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const { mutate: saveLink, isPending: isSavingLink } = useMutation({
    mutationFn: updateLink,
    onMutate: async ({ id, url }) => {
      await queryClient.cancelQueries({ queryKey: ["LINKS_INFO"] });
      const previous = queryClient.getQueryData(["LINKS_INFO"]);
      queryClient.setQueryData(["LINKS_INFO"], (old) => ({
        ...old,
        data: {
          ...old?.data,
          links: old?.data?.links?.map((l) =>
            l.id === id ? { ...l, original_url: url } : l,
          ),
        },
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["LINKS_INFO"], context.previous);
      toast.error("Update failed", "Could not save the link. Please try again.");
    },
    onSuccess: () => {
      toast.success("Link updated!", "The original URL has been saved.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
      setEditingId(null);
      setEditUrlValue("");
      setEditStatusValue("");
    },
  });

  const [editStatusValue, setEditStatusValue] = useState("");

  const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
    mutationFn: updateLinkStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["LINKS_INFO"] });
      const previous = queryClient.getQueryData(["LINKS_INFO"]);
      queryClient.setQueryData(["LINKS_INFO"], (old) => ({
        ...old,
        data: {
          ...old?.data,
          links: old?.data?.links?.map((l) =>
            l.id === id ? { ...l, status } : l
          ),
        },
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["LINKS_INFO"], context.previous);
      toast.error("Status update failed", "Could not change the link status.");
    },
    onSuccess: (_data, { status }) => {
      toast.success(
        status === "active" ? "Link activated" : "Link disabled",
        status === "active"
          ? "The link is now active and accepting traffic."
          : "The link is now disabled and will not redirect."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
      setEditingId(null);
      setEditStatusValue("");
    },
  });

  const { mutate: removeLink, isPending: isDeletingLink } = useMutation({
    mutationFn: deleteLink,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["LINKS_INFO"] });
      const previous = queryClient.getQueryData(["LINKS_INFO"]);
      queryClient.setQueryData(["LINKS_INFO"], (old) => ({
        ...old,
        data: {
          ...old?.data,
          links: old?.data?.links?.filter((l) => l.id !== id),
        },
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["LINKS_INFO"], context.previous);
      toast.error("Delete failed", "Could not delete the link. Please try again.");
    },
    onSuccess: () => {
      toast.success("Link deleted", "The link has been permanently removed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      removeLink({ id });
    }
  };

  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const { mutate: createNewLink, isPending: isCreating } = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      toast.success("Link created!", "Your short link is ready to use.");
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
      setIsCreatingLink(false);
      setNewLinkUrl("");
    },
    onError: (err) => {
      toast.error(
        "Creation failed",
        err.response?.data?.message || "Please check your URL and try again."
      );
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) {
      toast.warning("Empty URL", "Please enter a valid URL to shorten.");
      return;
    }
    createNewLink({ url: newLinkUrl.trim() });
  };


  const handleEditClick = (link) => {
    setEditingId(link.id);
    setEditUrlValue(link.original_url);
    setEditStatusValue(link.status);
  };

  const handleSaveEdit = (link) => {
    if (!editUrlValue.trim()) {
      toast.warning("Empty URL", "Please enter a valid URL before saving.");
      return;
    }
    const urlChanged = editUrlValue.trim() !== link.original_url;
    const statusChanged = editStatusValue !== link.status;
    if (!urlChanged && !statusChanged) {
      // Nothing actually changed — just close
      setEditingId(null);
      setEditUrlValue("");
      setEditStatusValue("");
      return;
    }
    if (urlChanged) saveLink({ id: editingId, url: editUrlValue.trim() });
    if (statusChanged) changeStatus({ id: editingId, status: editStatusValue });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUrlValue("");
    setEditStatusValue("");
  };


  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      : "—";

  const handleSaveProfileEdit = (formData) => {
    const data = Object.fromEntries(formData);
    updateProfile(data);
    setIsEditingProfile(false);
    toast.success(
      "Profile updated successfully!",
      "Your profile has been updated.",
    );
  };

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(
      import.meta.env.VITE_API_BASE_URL + "/" + shortUrl,
    );
    toast.success("Copied!", "Short URL copied to clipboard.");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans pb-20">
      {/* Header Navigation */}

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-10">
        {/* User Overview Section */}
        <section className="flex flex-col justify-between items-center sm:items-end sm:flex-row gap-6 bg-white p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 border border-gray-100 rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-10 right-20 w-32 h-32 bg-gray-50 border border-gray-100 rotate-12 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10 w-full sm:w-auto">
            <Avatar
              initials={name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
              className="w-20 h-20 text-2xl border-4 border-white shadow-sm shrink-0"
            />

            <div className="flex flex-col items-center sm:items-start">
              {isEditingProfile ? (
                <form
                  id="edit-profile-form"
                  action={handleSaveProfileEdit}
                  className="flex flex-col gap-2 w-full text-left"
                >
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                      type="text"
                      name="name"
                      defaultValue={name}
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        size="small"
                        className="flex-1 sm:flex-none"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        type="button"
                        className="flex-1 sm:flex-none"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {name}
                </h1>
              )}
              <p className="text-gray-500 mt-1">{email}</p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <Chip status="default">
                  Member since{" "}
                  {created_at ? new Date(created_at).getFullYear() : "—"}
                </Chip>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {!isEditingProfile && (
              <>
                {!isCreatingLink ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1 sm:flex-none"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 sm:flex-none"
                      onClick={() => setIsCreatingLink(true)}
                    >
                      Create Link
                    </Button>
                  </>
                ) : (
                  <form
                    onSubmit={handleCreateSubmit}
                    className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center"
                  >
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      autoFocus
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 flex-1 sm:w-64"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        size="small"
                        disabled={isCreating}
                        className="flex-1 sm:flex-none"
                      >
                        {isCreating ? "Shortening…" : "Shorten"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        type="button"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setIsCreatingLink(false);
                          setNewLinkUrl("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </section>

        {/* Key Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </section>

        {/* Link Management Table */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Your Links
              </h2>
              {hasActiveFilters && (
                <span className="text-xs text-gray-500">
                  {filteredLinks.length} of {links.length} shown
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search links..."
                className="px-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 w-full sm:w-64"
              />
              {/* Filter dropdown */}
              <div className="relative" ref={filterRef}>
                <Button
                  variant="secondary"
                  className="px-4 w-full sm:w-auto flex gap-2 items-center"
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M7 12h10M11 20h2" />
                  </svg>
                  Filter
                  {statusFilter !== "all" && (
                    <span className="w-2 h-2 rounded-full bg-gray-900 inline-block" />
                  )}
                </Button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 shadow-md z-50">
                    {[["all", "All"], ["active", "Active"], ["disabled", "Disabled"]].map(
                      ([value, label]) => (
                        <button
                          key={value}
                          onClick={() => { setStatusFilter(value); setFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                            ${statusFilter === value
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {label}
                          {statusFilter === value && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 whitespace-nowrap self-center"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile-First Card Layout (Small Screens) */}
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

          {/* Desktop Table Layout (Large Screens) */}
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
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
