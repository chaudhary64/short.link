import { useState } from "react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
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
import { LuTriangleAlert } from "react-icons/lu";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#0A0A0A] flex flex-col flex-1 font-body pb-20"
      >
        <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
          <div className="bg-white border border-[#EF4444]/30 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4 rounded-lg">
              <LuTriangleAlert className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-display font-bold text-[#0A0A0A] mb-1">Failed to load links</h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              {error?.response?.data?.message || "Something went wrong while fetching your links."}
            </p>
            <Button
              variant="primary"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying…" : "Try Again"}
            </Button>
          </div>
        </main>
      </motion.div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const { totalViews, activeCount, linksDelta, viewsDelta } =
    calculateDashboardStats(links);

  const isEmpty = links.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-[#0A0A0A] flex flex-col flex-1 font-body pb-20"
    >
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        <DashboardHeader
          createNewLink={createNewLinkMutation}
          isCreating={isCreatingLink}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
        />

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, type: "spring", stiffness: 300, damping: 24 }}
          >
            <DashboardEmptyState />
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, type: "spring", stiffness: 300, damping: 24 }}
            >
              <DashboardStats
                totalLinks={links.length}
                totalViews={totalViews}
                linksDelta={linksDelta}
                viewsDelta={viewsDelta}
                activeCount={activeCount}
                links={links}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, type: "spring", stiffness: 300, damping: 24 }}
            >
              <LinkManagement links={links} />
            </motion.div>
          </>
        )}
      </main>
    </motion.div>
  );
};

export default Dashboard;
