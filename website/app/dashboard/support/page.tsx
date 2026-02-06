import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Mail, MessageCircle, Book, ExternalLink } from "lucide-react";

export default async function SupportPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Support & Help</h1>
        <p className="text-text-secondary">
          Get help with Vanta Dictate
        </p>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <SupportCard
          icon={<Mail className="w-6 h-6" />}
          title="Email Support"
          description="Get help from our support team within 24 hours"
          action="Send Email"
          href="mailto:support@vantadictate.com"
        />
        <SupportCard
          icon={<MessageCircle className="w-6 h-6" />}
          title="Community"
          description="Join our Discord community for quick help"
          action="Join Discord"
          href="#"
        />
        <SupportCard
          icon={<Book className="w-6 h-6" />}
          title="Documentation"
          description="Browse guides and tutorials"
          action="View Docs"
          href="#"
        />
        <SupportCard
          icon={<ExternalLink className="w-6 h-6" />}
          title="Feature Requests"
          description="Suggest new features or improvements"
          action="Submit Idea"
          href="#"
        />
      </div>

      {/* Common Issues */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-6">Common Issues</h3>
        <div className="space-y-6">
          <Issue
            question="Dictation not working?"
            answer="Make sure you've downloaded the desktop app and granted microphone permissions. Check your Windows Sound Settings to ensure your microphone is set as the default input device."
          />
          <Issue
            question="Text not pasting correctly?"
            answer="Try enabling 'Typing Fallback' in the desktop app settings. This will type character-by-character if paste fails in certain applications."
          />
          <Issue
            question="Model download failed?"
            answer="Check your internet connection and available disk space. The base model requires ~142MB of free space. Try downloading again from the Transcription settings."
          />
          <Issue
            question="App won't start?"
            answer="Try running the app as administrator. If the issue persists, uninstall and reinstall the latest version from your dashboard."
          />
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Account Email</span>
            <span className="font-medium">{user.emailAddresses[0]?.emailAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">User ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Account Created</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-4">
          Include this information when contacting support
        </p>
      </div>
    </div>
  );
}

function SupportCard({
  icon,
  title,
  description,
  action,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-accent/10 rounded-lg text-accent">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <a
        href={href}
        className="inline-block px-4 py-2 glass glass-hover rounded-lg text-sm font-medium"
      >
        {action}
      </a>
    </div>
  );
}

function Issue({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-text-secondary text-sm">{answer}</p>
    </div>
  );
}
