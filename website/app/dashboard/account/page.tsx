import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";

export default async function AccountPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Account Settings</h1>
        <p className="text-text-secondary">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Clerk User Profile Component */}
      <div className="max-w-4xl">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "glass shadow-none",
            }
          }}
        />
      </div>
    </div>
  );
}
