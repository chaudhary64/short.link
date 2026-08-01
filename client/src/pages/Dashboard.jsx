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
import { LuTriangleAlert } from "react-icons/lu";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const accessToken = useAuthToken();

  const { data: linkInfo, isLoading, isError, error } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
    retry: 1,
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
        className="text-gray-900 flex flex-col flex-1 font-sans pb-20"
      >
        <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
          <div className="bg-white border border-red-200 shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
              <LuTriangleAlert className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load links</h3>
            <p className="text-sm text-gray-500 mb-4">
              {error?.response?.data?.message || "Something went wrong while fetching your links."}
            </p>
            <Button variant="primary" size="small" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </motion.div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const {
    totalViews,
    activeCount,
    linksDeltaDescription,
    viewsDeltaDescription,
    activeLinksDescription,
  } = calculateDashboardStats(links);

  const isEmpty = links.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-gray-900 flex flex-col flex-1 font-sans pb-20"
    >
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 24 }}
        >
          <DashboardHeader
            createNewLink={createNewLinkMutation}
            isCreating={isCreatingLink}
            totalLinks={links.length}
            activeLinks={activeCount}
          />
        </motion.div>

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
                linksDelta={linksDeltaDescription}
                viewsDelta={viewsDeltaDescription}
                activeCount={activeCount}
                activeDescription={activeLinksDescription}
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
