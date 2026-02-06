import Link from "next/link";
import { Zap, Lock, Gauge, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-xl font-semibold">Vanta Dictate</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition">Features</a>
            <a href="#pricing" className="text-text-secondary hover:text-text-primary transition">Pricing</a>
            <Link href="/login" className="text-text-secondary hover:text-text-primary transition">Login</Link>
            <Link href="/signup" className="px-4 py-2 bg-accent text-background rounded-lg font-medium hover:bg-accent-hover transition">
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight">
            Speak. It types.<br />
            <span className="text-accent">Everywhere.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Premium speech-to-text for people who type all day. Private, accurate, effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-accent text-background rounded-lg font-medium text-lg hover:bg-accent-hover transition">
              Get Started Free
            </Link>
            <a href="#demo" className="px-8 py-4 glass glass-hover rounded-lg font-medium text-lg">
              Watch Demo
            </a>
          </div>
          
          {/* Demo Placeholder */}
          <div className="mt-16 glass rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="aspect-video bg-surface rounded-lg flex items-center justify-center">
              <p className="text-text-secondary">Demo video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-16">
            Why Vanta Dictate?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-accent" />}
              title="Privacy-first"
              description="Your voice never leaves your device. 100% local processing."
            />
            <FeatureCard
              icon={<Gauge className="w-8 h-8 text-accent" />}
              title="Lightning fast"
              description="Zero latency. Instant transcription with local Whisper AI."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-accent" />}
              title="Accurate"
              description="Powered by OpenAI Whisper. Industry-leading accuracy."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-accent" />}
              title="Works everywhere"
              description="Any app, any text field. System-wide dictation."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-text-secondary text-center mb-16">
            For people who type all day
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-text-secondary mb-6">Try it risk-free</p>
              <div className="mb-8">
                <span className="text-4xl font-semibold">$0</span>
                <span className="text-text-secondary">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>60 minutes/day dictation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Local Whisper (base model)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>100% private & offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-text-secondary mt-1">×</span>
                  <span className="text-text-secondary">Smart formatting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-text-secondary mt-1">×</span>
                  <span className="text-text-secondary">Custom snippets</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center glass glass-hover rounded-lg font-medium">
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="glass rounded-2xl p-8 border-2 border-accent relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-background rounded-full text-sm font-medium">
                For serious users
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-text-secondary mb-6">Unlimited everything</p>
              <div className="mb-8">
                <span className="text-4xl font-semibold">$15</span>
                <span className="text-text-secondary">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="font-medium">Unlimited dictation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Lightning Mode (faster/raw)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Smart formatting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Custom snippets</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Multi-language auto-detect</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center bg-accent text-background rounded-lg font-medium hover:bg-accent-hover transition">
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-semibold">Vanta Dictate</span>
          </div>
          <nav className="flex gap-8">
            <a href="#" className="text-text-secondary hover:text-text-primary transition">Privacy</a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition">Terms</a>
            <a href="#" className="text-text-secondary hover:text-primary transition">Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 glass-hover">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  );
}
