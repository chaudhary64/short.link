import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import { LoginUser, GoogleLoginUser } from "../api/auth";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const loginMutation = useMutation({
    mutationFn: LoginUser,
    onSuccess: () => {
      toast.success("Welcome back!", "You have successfully logged in.");
      navigate("/");
    },
    onError: (err) => {
      toast.error("Login failed", err.response?.data?.message || "Please check your credentials and try again.");
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: GoogleLoginUser,
    onSuccess: () => {
      toast.success("Welcome!", "You have successfully logged in with Google.");
      navigate("/");
    },
    onError: (err) => {
      toast.error("Google Login failed", err.response?.data?.message || "An error occurred during Google Login.");
    }
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleLoginMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error("Google Login Failed", "Could not complete the login process.");
    }
  });

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden bg-slate-50">
      
      {/* Premium Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[420px] mx-auto bg-white p-6 sm:p-10 sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] sm:border sm:border-gray-200/60">
        <div className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500">
            Log in to your account to continue.
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
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Or email & password
          </span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full mt-2 py-2.5"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-gray-900 hover:underline focus:outline-none"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
