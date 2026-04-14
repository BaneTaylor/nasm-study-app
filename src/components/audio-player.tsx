"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

export default function AudioPlayer({ text }: { text: string }) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef(text);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep text ref in sync
  textRef.current = text;

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Stop on unmount or text change
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop, text]);

  function play() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setPlaying(true);
      setProgress(0);
      // Estimate progress based on duration
      const estimatedDuration = (text.length / 15) * (1 / speed); // rough chars-per-second
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(100, (elapsed / estimatedDuration) * 100);
        setProgress(pct);
      }, 200);
    };

    utterance.onend = () => {
      setPlaying(false);
      setProgress(100);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = () => {
      setPlaying(false);
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function togglePlay() {
    if (playing) {
      stop();
    } else {
      setExpanded(true);
      play();
    }
  }

  function cycleSpeed() {
    const currentIdx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setSpeed(newSpeed);
    // If currently playing, restart with new speed
    if (playing) {
      stop();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = newSpeed;
        utterance.onstart = () => {
          setPlaying(true);
          const estimatedDuration = (text.length / 15) * (1 / newSpeed);
          const startTime = Date.now();
          intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const pct = Math.min(100, (elapsed / estimatedDuration) * 100);
            setProgress(pct);
          }, 200);
        };
        utterance.onend = () => {
          setPlaying(false);
          setProgress(100);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => setProgress(0), 1000);
        };
        utterance.onerror = () => {
          setPlaying(false);
          setProgress(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  }

  if (!mounted || !window.speechSynthesis) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Play/Pause button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          playing
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
        }`}
        title={playing ? "Stop" : "Listen"}
      >
        {/* Progress ring */}
        {playing && progress > 0 && (
          <svg
            className="absolute inset-0 -rotate-90"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 * (1 - progress / 100)}
              className="transition-all duration-200"
            />
          </svg>
        )}
        {/* Speaker icon */}
        {!playing ? (
          <svg
            className="w-4 h-4 relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
            />
          </svg>
        )}
      </button>

      {/* Speed control — visible when expanded/playing */}
      {(expanded || playing) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cycleSpeed();
          }}
          className="text-[10px] font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full px-2 py-1 transition-colors"
          title="Change speed"
        >
          {speed}x
        </button>
      )}
    </div>
  );
}
