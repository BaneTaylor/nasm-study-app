"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./theme-toggle";

const primaryNav = [
  { href: "/campaign", label: "Learn", icon: "🎓" },
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/quiz", label: "Quiz", icon: "📝" },
  { href: "/coach", label: "Coach", icon: "🤖" },
  { href: "/stats", label: "Stats", icon: "📊" },
];

const moreNav = [
  { href: "/flashcards", label: "Flashcards", icon: "🗂️" },
  { href: "/chapters", label: "Chapters", icon: "📖" },
  { href: "/anatomy", label: "Anatomy", icon: "🦴" },
  { href: "/scenarios", label: "Scenarios", icon: "🏋️" },
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/exam-mode", label: "Exam Mode", icon: "🏆" },
  { href: "/share", label: "Share", icon: "📤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreNav.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 shadow-2xl">
            <div className="max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-400">More</span>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {moreNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                        isActive
                          ? "text-blue-400 bg-blue-600/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span className="text-[10px]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2">
          {primaryNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-1 min-w-[48px] text-xs transition-colors ${
                  isActive
                    ? "text-blue-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center px-3 py-1 min-w-[48px] text-xs transition-colors ${
              showMore || isMoreActive
                ? "text-blue-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-lg">•••</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
