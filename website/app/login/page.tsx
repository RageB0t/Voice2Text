import { SignIn } from "@clerk/nextjs";
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

        {/* Clerk Sign-in Component */}
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass shadow-2xl",
            }
          }}
        />
      </div>
    </div>
  );
}
