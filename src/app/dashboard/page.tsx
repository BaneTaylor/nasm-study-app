import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, display_name")
    .eq("id", user.id)
    .single();

  // TODO: Re-enable once onboarding is built in Phase 2
  // if (profile && !profile.onboarding_completed) {
  //   redirect("/onboarding");
  // }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
            </h1>
            <p className="text-gray-400">Your NASM study dashboard</p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-lg">
            Dashboard coming soon — this is the foundation. Study features will
            be added in upcoming phases.
          </p>
        </div>
      </div>
    </div>
  );
}
