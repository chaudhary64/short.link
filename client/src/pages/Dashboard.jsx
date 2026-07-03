import { useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllLinks } from "../api/links";
import { updateUser } from "../api/auth";

const Dashboard = () => {
  const { name, email, created_at } = useUserInfo();
  const { setUserInfo } = useUserActions();
  const accessToken = useAuthToken();

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

  // Real data from API — field names: original_url, short_code, views, status, created_at
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
  // const [editProfileForm, setEditProfileForm] = useState(user);

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

  const handleEditClick = (link) => {
    setEditingId(link.id);
    setEditUrlValue(link.original_url);
  };

  const handleSaveEdit = () => {
    // TODO: wire up to PUT /links/edit mutation
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUrlValue("");
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
                  Member since {created_at ? new Date(created_at).getFullYear() : "—"}
                </Chip>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {!isEditingProfile && (
              <>
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </Button>
                <Button variant="primary" className="flex-1 sm:flex-none">
                  Create Link
                </Button>
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
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Your Links
            </h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <input
                type="text"
                placeholder="Search links..."
                className="px-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 w-full sm:w-64"
              />
              <Button variant="secondary" className="px-4 w-full sm:w-auto">
                Filter
              </Button>
            </div>
          </div>

          {/* Mobile-First Card Layout (Small Screens) */}
          <div className="flex flex-col gap-4 lg:hidden">
            {links.map((link) => (
              <Card key={link.id} className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                      {link.short_code}
                      <button
                        className="text-gray-400 hover:text-gray-900"
                        title="Copy"
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
                  <div className="w-full">
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
                ) : (
                  <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                      Original URL
                    </label>
                    <p
                      className="text-sm text-gray-700 truncate"
                      title={link.original_url}
                    >
                      {link.original_url}
                    </p>
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
                          onClick={handleSaveEdit}
                          className="px-3"
                        >
                          Save
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
                          className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-semibold text-gray-900 flex items-center gap-2">
                      {link.short_code}
                      <button
                        className="text-gray-400 hover:text-gray-900"
                        title="Copy to clipboard"
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
                        {link.original_url}
                      </TableCell>
                    )}

                    <TableCell className="font-mono text-sm">
                      {(link.views ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip status={link.status}>
                        {link.status === "active"
                          ? "Active"
                          : link.status === "warning"
                            ? "Flagged"
                            : "Disabled"}
                      </Chip>
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
                            onClick={handleSaveEdit}
                            className="px-3 py-1"
                          >
                            Save
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
                            title="Edit Link"
                            onClick={() => handleEditClick(link)}
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              ></path>
                            </svg>
                          </button>
                          <button
                            className="text-gray-500 hover:text-red-600 p-1"
                            title="Delete Link"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
