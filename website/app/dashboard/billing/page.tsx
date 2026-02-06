import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Check, Zap } from "lucide-react";

export default async function BillingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Fetch actual subscription status from Supabase
  const currentPlan = "free"; // or "pro"

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Billing & Subscription</h1>
        <p className="text-text-secondary">
          Manage your plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Current Plan</h3>
            <p className="text-2xl font-bold text-accent">
              {currentPlan === "free" ? "Free" : "Pro"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {currentPlan === "free" 
                ? "60 minutes of dictation per day" 
                : "Unlimited dictation"}
            </p>
          </div>
          {currentPlan === "pro" && (
            <button className="px-6 py-2.5 glass glass-hover rounded-lg font-medium text-sm">
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`glass rounded-2xl p-6 ${currentPlan === "free" ? "border-2 border-accent" : ""}`}>
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <p className="text-text-secondary text-sm">
              Perfect for trying out Vanta Dictate
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <Feature>60 minutes/day dictation</Feature>
            <Feature>Local Whisper (base model)</Feature>
            <Feature>100% private & offline</Feature>
            <Feature disabled>Smart formatting</Feature>
            <Feature disabled>Custom snippets</Feature>
            <Feature disabled>Multi-language auto-detect</Feature>
          </ul>

          {currentPlan === "free" ? (
            <div className="px-6 py-2.5 bg-surface rounded-lg text-center font-medium text-sm text-text-secondary">
              Current Plan
            </div>
          ) : (
            <button className="w-full px-6 py-2.5 glass glass-hover rounded-lg font-medium text-sm">
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`glass rounded-2xl p-6 ${currentPlan === "pro" ? "border-2 border-accent" : "border border-accent/20"}`}>
          {currentPlan !== "pro" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-background rounded-full text-xs font-medium">
              Recommended
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">$15</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <p className="text-text-secondary text-sm">
              For serious users who type all day
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <Feature>Unlimited dictation</Feature>
            <Feature>Lightning Mode (faster/raw)</Feature>
            <Feature>Smart formatting</Feature>
            <Feature>Custom snippets</Feature>
            <Feature>Multi-language auto-detect</Feature>
            <Feature>Priority model options</Feature>
            <Feature>Early access to Agent Mode</Feature>
            <Feature>Priority support</Feature>
          </ul>

          {currentPlan === "pro" ? (
            <div className="px-6 py-2.5 bg-accent/10 rounded-lg text-center font-medium text-sm text-accent">
              Current Plan
            </div>
          ) : (
            <button className="w-full px-6 py-2.5 bg-accent text-background rounded-lg font-medium text-sm hover:bg-accent-hover transition">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <FAQ 
            question="Can I cancel anytime?"
            answer="Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period."
          />
          <FAQ 
            question="What happens when I reach the free tier limit?"
            answer="When you reach your 60-minute daily limit, you'll see a calm message suggesting an upgrade. Your app will continue to work the next day."
          />
          <FAQ 
            question="Do you offer refunds?"
            answer="Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund."
          />
          <FAQ 
            question="Is my payment information secure?"
            answer="Absolutely. We use Stripe for payment processing, which is PCI-compliant and trusted by millions of businesses."
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${disabled ? "text-text-secondary" : "text-accent"}`} />
      <span className={disabled ? "text-text-secondary" : ""}>{children}</span>
    </li>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-text-secondary text-sm">{answer}</p>
    </div>
  );
}
