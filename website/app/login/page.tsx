import Link from "next/link";
import { Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Zap className="w-8 h-8 text-accent" />
          <span className="text-2xl font-semibold">Vanta Dictate</span>
        </Link>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-semibold mb-2 text-center">Welcome back</h1>
          <p className="text-text-secondary text-center mb-8">
            Sign in to your account
          </p>

          {/* Clerk will be integrated here */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg focus:outline-none focus:border-accent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg focus:outline-none focus:border-accent transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-white/10" />
                <span className="text-text-secondary">Remember me</span>
              </label>
              <a href="#" className="text-accent hover:underline">
                Forgot password?
              </a>
            </div>

            <button className="w-full py-3 bg-accent text-background rounded-lg font-medium hover:bg-accent-hover transition">
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-text-secondary">or</span>
              </div>
            </div>

            <button className="w-full py-3 glass glass-hover rounded-lg font-medium">
              Continue with Email Link
            </button>
          </div>

          <p className="text-center text-sm text-text-secondary mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
