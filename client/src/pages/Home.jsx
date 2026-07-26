import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";

const Home = () => {
  const token = useAuthToken();
  const isAuthenticated = token ? true : false;
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      toast.success("Link shortened!", "Your short link is ready to use.");

    },
    onError: (err) => {
      toast.error("Failed to shorten", err.response?.data?.message || "Please check your URL and try again.");
    }
  });
  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    mutation.mutate(data);
  };

  return (
    <div className="flex-1 bg-[#fafafa] text-gray-900 flex flex-col font-sans">

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 w-full max-w-5xl mx-auto">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
            Simplify your links.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            The beautiful, minimal short.link. Paste your long link below and
            we'll make it short and sweet.
          </p>
        </div>

        <form
          action={handleSubmit}
          className="w-full max-w-xl mb-16 flex flex-col sm:flex-row gap-3 px-4 sm:px-0"
        >
          <input
            className={`flex-1 bg-white border border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 text-base px-5 py-4 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 rounded-none transition-all ${!isAuthenticated && "cursor-not-allowed opacity-60"}`}
            placeholder={
              isAuthenticated
                ? "Enter your long URL here..."
                : "Please log in to shorten URLs"
            }
            disabled={!isAuthenticated}
            name="url"
          />
          <Button
            size="large"
            className="rounded-none! w-full sm:w-auto shadow-sm"
            disabled={!isAuthenticated}
            type="submit"
            tooltip={
              !isAuthenticated
                ? "Please log in to shorten URLs"
                : "Shorten your URL"
            }
          >
            Shorten
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Card className="flex flex-col items-start gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 m-0">Lightning Fast</h4>
            <p className="text-sm text-gray-500 m-0 leading-relaxed">
              Experience incredibly fast redirects and a snappy interface built
              for speed and efficiency.
            </p>
          </Card>
          <Card className="flex flex-col items-start gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 m-0">Detailed Analytics</h4>
            <p className="text-sm text-gray-500 m-0 leading-relaxed">
              Track engagement in real-time. Monitor clicks, geographic data, and referrers to optimize your campaigns.
            </p>
          </Card>
          <Card className="flex flex-col items-start gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-none bg-purple-50 text-purple-600 flex items-center justify-center">
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
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                ></path>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 m-0">Always Up</h4>
            <p className="text-sm text-gray-500 m-0 leading-relaxed">
              Built on reliable infrastructure so your links work perfectly 24/7
              without interruption.
            </p>
          </Card>
        </div>
      </main>

    </div>
  );
};

export default Home;
