import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Download } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-surface/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-xl font-semibold">Vanta Dictate</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">
              {user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-semibold mb-2">Welcome back!</h1>
        <p className="text-text-secondary mb-12">
          You're all set. Download the desktop app to start dictating.
        </p>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Download Card */}
          <div className="glass rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Download Desktop App</h3>
                <p className="text-text-secondary mb-4">
                  Get the Vanta Dictate app for Windows to start dictating.
                </p>
                <button className="px-6 py-3 bg-accent text-background rounded-lg font-medium hover:bg-accent-hover transition">
                  Download for Windows
                </button>
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-2">Your Plan</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-semibold">Free</span>
              <span className="text-text-secondary">60 min/day</span>
            </div>
            <p className="text-text-secondary mb-4">
              Upgrade to Pro for unlimited dictation and premium features.
            </p>
            <Link 
              href="/dashboard/billing" 
              className="inline-block px-6 py-3 glass glass-hover rounded-lg font-medium"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        {/* Usage Stats (Placeholder) */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6">Today's Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Dictation time</span>
                <span className="font-medium">0 / 60 minutes</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '0%' }} />
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              Download the desktop app to start tracking your usage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
