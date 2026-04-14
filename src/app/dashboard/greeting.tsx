"use client";

import { useEffect, useState } from "react";

export default function Greeting({ displayName }: { displayName?: string | null }) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <h1 className="text-3xl font-bold text-white">
      {greeting}
      {displayName ? `, ${displayName}` : ""}
    </h1>
  );
}
