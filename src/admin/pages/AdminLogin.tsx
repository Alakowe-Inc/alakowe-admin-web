import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import logo from "@/assets/media/logos/favicon.png";
import { useAdminLogin } from "../../lib/api/admin/admin.hooks";

const ADMIN_EMAIL = "admin@alakowe.app";
const ADMIN_PASSWORD = "alakowe2026";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [cancelRedirect, setCancelRedirect] = useState(false);
  const [hidePopup, setHidePopup] = useState(false);

  const adminLogin = useAdminLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const isMock = import.meta.env.VITE_USE_MOCK === "true";
    if (isMock && (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD)) {
      setError("Invalid admin credentials. Please try again.");
      toast.error("Authentication failed: Invalid email or password.");
      return;
    }

    try {
      const result = await adminLogin.mutateAsync({
        emailAddress: email.trim(),
        password: password,
      });
      sessionStorage.setItem("alakowe_admin_authed", "1");
      if (result?.token) {
        sessionStorage.setItem("alakowe_admin_token", result.token);
      }
      if (result?.roleName) {
        sessionStorage.setItem("alakowe_admin_role", result.roleName);
      }
      toast.success("Welcome back");
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Authentication failed. Please check your credentials.");
      toast.error("Authentication failed: Invalid email or password.");
    }
  };

  useEffect(() => {
    const loggedOut = sessionStorage.getItem("alakowe_admin_logged_out");

    if (loggedOut) {
      setShowLogoutPopup(true);
      sessionStorage.removeItem("alakowe_admin_logged_out");
    }
  }, []);

  useEffect(() => {
    if (!showLogoutPopup || cancelRedirect) return;

    if (countdown <= 0) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, showLogoutPopup, cancelRedirect, navigate]);

  useEffect(() => {
    if (!cancelRedirect) return;

    const hideTimer = setTimeout(() => {
      setHidePopup(true);

      setTimeout(() => {
        setShowLogoutPopup(false);
      }, 400);
    }, 2000);

    return () => clearTimeout(hideTimer);
  }, [cancelRedirect]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-secondary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-secondary/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--secondary)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--secondary)/0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Premium loading overlay */}
      {adminLogin.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sidebar/95 backdrop-blur-xl animate-fade-in">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-secondary/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-secondary border-r-secondary/60" style={{ animationDuration: "1.4s" }} />
            <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-b-secondary/80 border-l-secondary/40" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary shadow-glow">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="font-display text-lg font-semibold tracking-wide text-white">Authenticating</p>
            <p className="mt-1.5 text-sm text-sidebar-foreground/70">
              Verifying credentials
              <span className="ml-1 inline-flex">
                <span className="animate-pulse" style={{ animationDelay: "0ms" }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: "200ms" }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: "400ms" }}>.</span>
              </span>
            </p>
            <div className="mx-auto mt-5 h-0.5 w-48 overflow-hidden rounded-full bg-sidebar-accent">
              <div className="h-full w-1/3 animate-[slide-in-right_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-secondary to-transparent" />
            </div>
          </div>
        </div>
      )}

      {showLogoutPopup && (
        <div
          className={`
            fixed z-[100] transition-all duration-500
            top-4 right-4 left-4 sm:left-auto
            sm:top-5 sm:right-5
            ${hidePopup
              ? "translate-x-[120%] opacity-0"
              : "translate-x-0 opacity-100"}
          `}
        >
          <div className="w-full sm:w-[340px] rounded-2xl border border-sidebar-border bg-sidebar-accent/95 p-4 sm:p-5 shadow-elegant backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  You've logged out
                </h3>

                {!cancelRedirect ? (
                  <p className="mt-1 text-xs text-sidebar-foreground/70">
                    Redirecting to homepage in{" "}
                    <span className="font-bold text-secondary">
                      {countdown}s
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-green-400">
                    Homepage redirect cancelled.
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setCancelRedirect(true);
                }}
                className="h-9 rounded-lg bg-secondary px-4 text-xs font-medium text-primary transition hover:bg-secondary/90 w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary shadow-glow">
              <Link to="/" className="">
                <img src={logo} alt="Alakowé" className="h-9 w-9 object-contain" />
              </Link>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">ALÁKÒWÉ</h1>
            <p className="mt-1 text-sm text-sidebar-foreground/70">Admin Console · A new way to read</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-7 shadow-elegant backdrop-blur-xl animate-scale-in">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-sidebar-foreground/70">Sign in to manage the marketplace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-sidebar-foreground/80">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@alakowe.app"
                    required
                    className="h-11 border-sidebar-border bg-sidebar/60 pl-10 text-white placeholder:text-sidebar-foreground/40 focus-visible:ring-secondary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-sidebar-foreground/80">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="h-11 border-sidebar-border bg-sidebar/60 pl-10 text-white placeholder:text-sidebar-foreground/40 focus-visible:ring-secondary"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground animate-fade-in">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={adminLogin.isPending}
                className="group h-11 w-full bg-secondary font-semibold text-primary shadow-glow transition-all hover:bg-secondary/90 hover:shadow-elegant"
              >
                {adminLogin.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating…</>
                ) : (
                  <>Sign in to Admin <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">→</span></>
                )}
              </Button>
            </form>

            <Link to="/">
              <Button
                variant="outline"
                className="mt-4 h-11 w-full border-sidebar-border bg-transparent text-white hover:bg-sidebar-accent text-white transition-all"
              >
                Back to Homepage
              </Button>
            </Link>

            <div className="mt-6 rounded-lg border border-sidebar-border bg-sidebar/40 px-3 py-2.5 text-[11px] text-sidebar-foreground/60">
              <span className="font-medium text-sidebar-foreground/80">Demo credentials:</span> admin@alakowe.app / alakowe2026
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-sidebar-foreground/50">
            Protected area · All admin activity is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
