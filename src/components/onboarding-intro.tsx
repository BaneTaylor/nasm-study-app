"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    title: "Welcome to NASM Study",
    tagline: "Your personal path to passing the NASM CPT exam",
    graphic: "welcome",
  },
  {
    title: "Smart Study Plan",
    tagline:
      "We assess how you learn best, then build a personalized week-by-week study plan",
    graphic: "calendar",
  },
  {
    title: "Flashcards & Quizzes",
    tagline:
      "340+ flashcards with spaced repetition and 230+ exam-style questions",
    graphic: "cards",
  },
  {
    title: "Track Everything",
    tagline:
      "Real-time stats, exam readiness score, and smart alerts for weak areas",
    graphic: "progress",
  },
  {
    title: "AI Study Coach",
    tagline:
      "Ask anything about NASM — get instant, clear answers from your AI tutor",
    graphic: "chat",
  },
];

/* ─── Animated graphics for each slide ─── */

function WelcomeGraphic() {
  return (
    <div className="relative flex items-center justify-center h-48">
      <div
        className="text-6xl font-black tracking-tight"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #22c55e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "scaleIn 0.8s ease-out both",
        }}
      >
        NASM
      </div>
      <div
        className="absolute -inset-8 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #3b82f6 0%, #8b5cf6 50%, transparent 70%)",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function CalendarGraphic() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="grid grid-cols-7 gap-1.5 w-56">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-sm"
            style={{
              backgroundColor:
                i < 21
                  ? `hsl(${220 + i * 4}, 70%, ${45 + i}%)`
                  : "rgba(255,255,255,0.06)",
              animation: `fadeSlideUp 0.4s ease-out ${i * 0.04}s both`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CardsGraphic() {
  return (
    <div className="flex items-center justify-center h-48 perspective-[600px]">
      <div
        className="relative w-40 h-24"
        style={{ animation: "cardFlip 2.5s ease-in-out infinite" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            backfaceVisibility: "hidden",
          }}
        >
          Question
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #22c55e, #3b82f6)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          Answer
        </div>
      </div>
      {/* Shadow cards behind */}
      <div
        className="absolute w-36 h-20 rounded-xl opacity-20"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          transform: "translate(8px, 8px) rotate(3deg)",
        }}
      />
      <div
        className="absolute w-36 h-20 rounded-xl opacity-10"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          transform: "translate(16px, 16px) rotate(6deg)",
        }}
      />
    </div>
  );
}

function ProgressGraphic() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4 w-64 mx-auto">
      {[
        { label: "OPT Model", pct: 85, color: "#3b82f6", delay: "0s" },
        { label: "Anatomy", pct: 72, color: "#8b5cf6", delay: "0.2s" },
        { label: "Nutrition", pct: 60, color: "#22c55e", delay: "0.4s" },
      ].map((bar) => (
        <div key={bar.label} className="w-full">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{bar.label}</span>
            <span>{bar.pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${bar.pct}%`,
                backgroundColor: bar.color,
                animation: `progressFill 1.2s ease-out ${bar.delay} both`,
                transformOrigin: "left",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatGraphic() {
  const messages = [
    { text: "What is the OPT model?", isUser: true, delay: "0s" },
    {
      text: "The OPT model is NASM's systematic approach to training...",
      isUser: false,
      delay: "0.5s",
    },
    { text: "How many phases does it have?", isUser: true, delay: "1s" },
  ];
  return (
    <div className="flex flex-col gap-2.5 h-48 justify-center w-64 mx-auto">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
            msg.isUser
              ? "self-end bg-blue-600 text-white rounded-br-sm"
              : "self-start bg-white/10 text-gray-200 rounded-bl-sm"
          }`}
          style={{
            animation: `fadeSlideUp 0.5s ease-out ${msg.delay} both`,
          }}
        >
          {msg.text}
        </div>
      ))}
      {/* Typing indicator */}
      <div
        className="self-start flex gap-1 px-3.5 py-2.5 bg-white/10 rounded-2xl rounded-bl-sm"
        style={{ animation: "fadeSlideUp 0.5s ease-out 1.5s both" }}
      >
        {[0, 1, 2].map((d) => (
          <div
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
            style={{
              animation: `typingDot 1.2s ease-in-out ${d * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const GRAPHIC_MAP: Record<string, () => React.JSX.Element> = {
  welcome: WelcomeGraphic,
  calendar: CalendarGraphic,
  cards: CardsGraphic,
  progress: ProgressGraphic,
  chat: ChatGraphic,
};

/* ─── Keyframe styles injected once ─── */

const KEYFRAMES = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.05); }
}
@keyframes cardFlip {
  0%, 40% { transform: rotateY(0deg); }
  50%, 90% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}
@keyframes progressFill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(60px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-60px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

export default function OnboardingIntro() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [slideKey, setSlideKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const router = useRouter();

  // Check localStorage on mount
  useEffect(() => {
    try {
      if (localStorage.getItem("hasSeenIntro") !== "true") {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — don't show
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem("hasSeenIntro", "true");
    } catch {
      // noop
    }
    setVisible(false);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= SLIDES.length || index === current) return;
      setDirection(index > current ? "right" : "left");
      setCurrent(index);
      setSlideKey((k) => k + 1);
    },
    [current],
  );

  const next = useCallback(() => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    }
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) {
      goTo(current - 1);
    }
  }, [current, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (current < SLIDES.length - 1) {
        next();
      }
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, visible, next]);

  // Keyboard support
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, next, prev, dismiss]);

  // Touch / swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartRef.current === null) return;
      const diff = touchStartRef.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
      touchStartRef.current = null;
    },
    [next, prev],
  );

  if (!visible) return null;

  const slide = SLIDES[current];
  const Graphic = GRAPHIC_MAP[slide.graphic];
  const isLast = current === SLIDES.length - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(145deg, #0a0a1a 0%, #0f0f2a 40%, #0a1a14 100%)",
          animation: "overlayIn 0.4s ease-out both",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #3b82f6, #8b5cf6, transparent)",
          }}
        />

        {/* Skip link */}
        <button
          onClick={dismiss}
          className="absolute top-6 right-6 text-sm text-gray-500 hover:text-gray-300 transition-colors z-10"
        >
          Skip
        </button>

        {/* Slide content */}
        <div
          key={slideKey}
          className="relative flex flex-col items-center justify-center px-8 max-w-lg mx-auto text-center"
          style={{
            animation: `${direction === "right" ? "slideInRight" : "slideInLeft"} 0.45s ease-out both`,
          }}
        >
          {/* Graphic */}
          <div className="mb-8">{Graphic && <Graphic />}</div>

          {/* Title */}
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{
              animation: "fadeSlideUp 0.5s ease-out 0.1s both",
            }}
          >
            {slide.title}
          </h2>

          {/* Tagline */}
          <p
            className="text-gray-400 text-base md:text-lg leading-relaxed max-w-sm"
            style={{
              animation: "fadeSlideUp 0.5s ease-out 0.25s both",
            }}
          >
            {slide.tagline}
          </p>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6 px-8">
          {/* Dots */}
          <div className="flex gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width: i === current ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i === current ? "#3b82f6" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            {isLast ? (
              <button
                onClick={() => {
                  dismiss();
                  router.push("/signup");
                }}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={next}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
