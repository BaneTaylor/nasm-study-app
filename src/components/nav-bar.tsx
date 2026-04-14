"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/flashcards", label: "Cards", icon: "🗂️" },
  { href: "/quiz", label: "Quiz", icon: "📝" },
  { href: "/chapters", label: "Chapters", icon: "📖" },
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/coach", label: "Coach", icon: "🤖" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                isActive ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center px-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
