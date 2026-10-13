
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Command, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { login } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to sign in. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090B12] px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0D101A] shadow-2xl shadow-black/30 lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-white/[0.07] bg-gradient-to-br from-violet-500/[0.12] via-[#101629] to-[#0C1521] p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
              <Command size={21} />
            </div>
            <span className="text-sm font-bold">
              Brahmaverse <span className="text-violet-400">AI</span>
            </span>
          </div>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1.5 text-xs text-violet-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Your workspace awaits
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Every connection
              <br />
              starts with an
              <br />
              <span className="text-violet-300">opportunity.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Find enquiries, take ownership of leads, and help students move
              towards their next chapter.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-emerald-400" />
            Secure counselor access
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
              <Command size={21} />
            </div>
            <span className="text-sm font-bold">
              Brahmaverse <span className="text-violet-400">AI</span>
            </span>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
            Counselor portal
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.025] px-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.025] px-4 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to workspace"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            New counselor?{" "}
            <Link to="/register" className="font-medium text-violet-300 hover:text-violet-200">
              Create an account
            </Link>
          </p>

          <p className="mt-10 text-center text-[10px] text-slate-600">
            Protected workspace · Brahmaverse AI
          </p>
        </section>
      </div>
    </main>
  );
}
