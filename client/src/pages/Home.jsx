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
      // Optionally reset the form here if we had a ref
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
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans">

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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 m-0">Secure</h4>
            <p className="text-sm text-gray-500 m-0 leading-relaxed">
              Your data is safe with us. We use modern encryption to ensure your
              links are secure.
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
