import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLink, updateLinkStatus, deleteLink } from "../../api/links";
import { useToast } from "../../features/toast/useToast.jsx";
import LinksFilterBar from "./LinksFilterBar";
import LinksMobileList from "./LinksMobileList";
import LinksTable from "./LinksTable";
import QRCodeModal from "../ui/QRCodeModal";

const LinkManagement = ({ links }) => {
  const [editingId, setEditingId] = useState(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editStatusValue, setEditStatusValue] = useState("");
  const [qrModalLink, setQrModalLink] = useState(null);

  const queryClient = useQueryClient();
  const toast = useToast();

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

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(
      import.meta.env.VITE_API_BASE_URL + "/" + shortUrl,
    );
    toast.success("Copied!", "Short URL copied to clipboard.");
  };

  const handleShowQR = (link) => setQrModalLink(link);

  const commonProps = {
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
  };

  return (
    <section className="flex flex-col gap-4">
      <LinksFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        totalLinksCount={links.length}
        filteredLinksCount={filteredLinks.length}
      />
      <LinksMobileList {...commonProps} />
      <LinksTable {...commonProps} />
      <QRCodeModal
        open={!!qrModalLink}
        onClose={() => setQrModalLink(null)}
        shortCode={qrModalLink?.short_code || ""}
        shortUrl={
          qrModalLink
            ? import.meta.env.VITE_API_BASE_URL + "/" + qrModalLink.short_code
            : ""
        }
      />
    </section>
  );
};

export default LinkManagement;
