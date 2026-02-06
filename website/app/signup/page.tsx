import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignupPage() {
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

        {/* Clerk Sign-up Component */}
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass shadow-2xl",
            }
          }}
        />

        {/* Privacy note */}
        <p className="text-center text-xs text-text-secondary mt-6">
          By signing up, you agree to our{" "}
          <a href="#" className="text-accent hover:underline">Terms</a> and{" "}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
