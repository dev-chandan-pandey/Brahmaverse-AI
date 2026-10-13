
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Command, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { register } from "../lib/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Account created successfully.");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090B12] px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/[0.09] bg-[#0D101A] p-7 shadow-2xl shadow-black/30 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
            <Command size={21} />
          </div>
          <div>
            <p className="text-sm font-bold">
              Brahmaverse <span className="text-violet-400">AI</span>
            </p>
            <p className="mt-1 text-[10px] tracking-widest text-slate-500">
              COUNSELOR PORTAL
            </p>
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Join your team and start managing enquiries.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-medium text-slate-300">
              Full name
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm outline-none focus:border-violet-400/60"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-xs font-medium text-slate-300">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm outline-none focus:border-violet-400/60"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-2 block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 pr-12 text-sm outline-none focus:border-violet-400/60"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold hover:bg-violet-400 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-violet-300 hover:text-violet-200">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
