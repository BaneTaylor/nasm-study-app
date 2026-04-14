"use client";

import { usePathname } from "next/navigation";
import NavBar from "./nav-bar";

const publicPaths = ["/", "/login", "/signup"];

export default function NavWrapper() {
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);

  if (isPublic) return null;

  return <NavBar />;
}
