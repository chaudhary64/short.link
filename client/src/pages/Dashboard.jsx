import UserOverview from "../components/dashboard/UserOverview";
import DashboardStats from "../components/dashboard/DashboardStats";
import LinkManagement from "../components/dashboard/LinkManagement";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLinks, createLink } from "../api/links";
import { updateUser } from "../api/auth";
import { useToast } from "../features/toast/useToast.jsx";
import { calculateDashboardStats } from "../utils/dashboardUtils";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const accessToken = useAuthToken();
  const { name, email, created_at } = useUserInfo();
  const { setUserInfo } = useUserActions();

  const { data: linkInfo } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
  });

  const links = linkInfo?.data?.links ?? [];

  const { mutate: updateProfileMutation } = useMutation({
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

  const { mutate: createNewLinkMutation, isPending: isCreatingLink } = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      toast.success("Link created!", "Your short link is ready to use.");
      queryClient.invalidateQueries({ queryKey: ["LINKS_INFO"] });
    },
    onError: (err) => {
      toast.error(
        "Creation failed",
        err.response?.data?.message || "Please check your URL and try again."
      );
    }
  });
  const {
    totalViews,
    activeCount,
    linksDeltaDescription,
    viewsDeltaDescription,
    activeLinksDescription,
  } = calculateDashboardStats(links);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans pb-20">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-10">
        <UserOverview
          name={name}
          email={email}
          created_at={created_at}
          updateProfile={updateProfileMutation}
          createNewLink={createNewLinkMutation}
          isCreating={isCreatingLink}
        />

        <DashboardStats
          totalLinks={links.length}
          totalViews={totalViews}
          linksDelta={linksDeltaDescription}
          viewsDelta={viewsDeltaDescription}
          activeCount={activeCount}
          activeDescription={activeLinksDescription}
        />

        <LinkManagement links={links} />
      </main>
    </div>
  );
};

export default Dashboard;
