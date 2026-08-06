import { useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import LinkManagement from "../components/dashboard/LinkManagement";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardEmptyState from "../components/dashboard/DashboardEmptyState";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLinks, createLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import { calculateDashboardStats } from "../utils/dashboardUtils";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const accessToken = useAuthToken();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: linkInfo,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
    retry: 1,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const links = linkInfo?.data?.links ?? [];

  const { mutate: createNewLinkMutation, isPending: isCreatingLink } =
    useMutation({
      mutationFn: createLink,
      onSuccess: () => {
        toast.success("Link created!", "Your short link is ready to use.");
        queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
      },
      onError: (err) => {
        toast.error(
          "Creation failed",
          err.response?.data?.message || "Please check your URL and try again.",
        );
      },
    });

  if (isError) {
    return (
      <div className="g-page">
        <main className="flex w-full flex-1 flex-col gap-7 pt-8 pb-[60px]">
          <div className="g-empty">
            <div className="g-empty-glyph">!</div>
            <h2 className="g-empty-title">Failed to load links</h2>
            <p className="g-empty-sub">
              {error?.response?.data?.message ||
                "Something went wrong while fetching your links."}
            </p>
            <button
              className="g-btn g-btn-sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying…" : "Try Again"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const { totalViews, activeCount, linksDelta, viewsDelta } =
    calculateDashboardStats(links);

  const isEmpty = links.length === 0;

  return (
    <div className="g-page">
      <main className="flex w-full flex-1 flex-col gap-7 pt-8 pb-[60px]">
        <DashboardHeader
          createNewLink={createNewLinkMutation}
          isCreating={isCreatingLink}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
        />

        {isEmpty ? (
          <DashboardEmptyState />
        ) : (
          <>
            <DashboardStats
              totalLinks={links.length}
              totalViews={totalViews}
              linksDelta={linksDelta}
              viewsDelta={viewsDelta}
              activeCount={activeCount}
              links={links}
            />
            <LinkManagement links={links} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
