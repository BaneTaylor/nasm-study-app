"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors text-sm"
    >
      Log Out
    </button>
  );
}
