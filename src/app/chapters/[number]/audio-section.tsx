"use client";

import { useMemo } from "react";
import AudioPlayer from "@/components/audio-player";

type AudioSectionProps = {
  chapterTitle: string;
  summary: string;
  keyTerms: { term: string; definition: string }[];
};

export default function AudioSection({
  chapterTitle,
  summary,
  keyTerms,
}: AudioSectionProps) {
  const fullText = useMemo(() => {
    const termsText = keyTerms
      .map((kt) => `${kt.term}: ${kt.definition}`)
      .join(". ");
    return `${chapterTitle}. ${summary}. Key Terms. ${termsText}`;
  }, [chapterTitle, summary, keyTerms]);

  return (
    <div className="inline-flex items-center gap-2 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5">
      <AudioPlayer text={fullText} />
      <span className="text-sm text-gray-400">Listen to this chapter</span>
    </div>
  );
}
