import { Link, useNavigate } from "react-router";
import { SignUpUser, GoogleLoginUser } from "../api/auth";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const Signup = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthActions();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: SignUpUser,
    onSuccess: ({ data }) => {
      toast.success("Account created!", "You have successfully signed up.");
      setAccessToken(data.accessToken);
      navigate("/");
    },
    onError: (err) => {
      toast.error("Signup failed", err.response?.data?.message || "Please check your details and try again.");
    },
  });

  const googleMutation = useMutation({
    mutationFn: GoogleLoginUser,
    onSuccess: ({ data }) => {
      toast.success("Welcome!", "You have successfully signed in with Google.");
      setAccessToken(data.accessToken);
      navigate("/");
    },
    onError: (err) => {
      toast.error("Google Login failed", err.response?.data?.message || "An error occurred during Google Login.");
    }
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error("Google Login Failed", "Could not complete the login process.");
    }
  });

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen font-sans 2xl:flex 2xl:items-center 2xl:justify-center 2xl:p-12">
      <div className="flex flex-col md:flex-row w-full min-h-screen md:h-screen 2xl:min-h-[700px] 2xl:h-auto 2xl:max-w-6xl mx-auto bg-white 2xl:rounded-3xl 2xl:overflow-hidden 2xl:shadow-2xl 2xl:border 2xl:border-gray-100">

        <div className="hidden md:flex flex-col justify-between w-[45%] lg:w-1/2 bg-gray-900 text-white p-8 lg:p-12 relative overflow-hidden">

          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[48px_48px]"></div>


          <div className="absolute top-20 right-20 w-64 h-64 border border-white/10 rotate-12 pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 pointer-events-none"></div>

          <div
            className="relative z-10 flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate && onNavigate("home")}
          >
            <Logo className="w-8 h-8" bg="#ffffff" fg="#111827" />
            <h3 className="font-bold text-2xl tracking-tight m-0">short.link</h3>
          </div>

          <div className="relative z-10 max-w-lg mt-auto mb-auto">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
              Start scaling today.
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 font-medium">
              Create an account to gain access to enterprise-grade link management
              and analytics.
            </p>
          </div>
        </div>


        <div className="flex-1 bg-[#fafafa] 2xl:bg-white p-6 sm:p-8 2xl:p-12 flex flex-col justify-center overflow-y-auto">

          <Link
            to="/"
            className="flex md:hidden items-center gap-2 justify-center mb-8 shrink-0"
          >
            <Logo />
            <h3 className="font-bold text-xl tracking-tight m-0 text-gray-900">
              short.link
            </h3>
          </Link>

          <div className="w-full max-w-sm m-auto py-10 md:py-0">
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1">
                Create an account
              </h2>
              <p className="text-sm text-gray-500">
                Get started for free. No credit card required.
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <button 
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  ></path>
                </svg>
                Sign up with GitHub
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                Or with email
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="Alex Doe"
                  className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  placeholder="Create a strong password"
                  className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full mt-2 py-2.5"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-gray-900 hover:underline focus:outline-none"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
