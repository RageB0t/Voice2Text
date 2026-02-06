import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Zap, Clock, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          Welcome back, {user.firstName || 'there'}!
        </h1>
        <p className="text-text-secondary">
          Here's your dictation overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Today's Usage"
          value="0 min"
          subtitle="60 min available"
          color="accent"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="This Week"
          value="0 min"
          subtitle="420 min available"
          color="accent"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Current Plan"
          value="Free"
          subtitle="60 min/day"
          color="accent"
        />
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Download Card */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Download className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Get the Desktop App</h3>
              <p className="text-text-secondary mb-4 text-sm">
                Download Vanta Dictate for Windows to start dictating in any application.
              </p>
              <button className="px-6 py-2.5 bg-accent text-background rounded-lg font-medium hover:bg-accent-hover transition text-sm">
                Download for Windows
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="glass rounded-2xl p-6 border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-text-secondary mb-4 text-sm">
                Get unlimited dictation, smart formatting, and premium features for $15/month.
              </p>
              <Link 
                href="/dashboard/billing"
                className="inline-block px-6 py-2.5 glass glass-hover rounded-lg font-medium text-sm"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Usage This Week</h3>
        <div className="space-y-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="flex items-center gap-4">
              <span className="text-sm text-text-secondary w-12">{day}</span>
              <div className="flex-1 h-8 bg-surface rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent/50 to-accent transition-all"
                  style={{ width: `${Math.random() * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-16 text-right">0 min</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-text-secondary mt-6">
          Install the desktop app to start tracking your usage.
        </p>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtitle: string; 
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 bg-${color}/10 rounded-lg text-${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      <p className="text-xs text-text-secondary">{subtitle}</p>
    </div>
  );
}
