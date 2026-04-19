"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chapter?: number;
}

interface ChapterOption {
  number: number;
  title: string;
}

const CHAPTERS: ChapterOption[] = [
  { number: 1, title: "Scientific Rationale for Integrated Training" },
  { number: 2, title: "Basic Exercise Science" },
  { number: 3, title: "The Cardiorespiratory System" },
  { number: 4, title: "Exercise Metabolism and Bioenergetics" },
  { number: 5, title: "Human Movement Science" },
  { number: 6, title: "Fitness Assessment" },
  { number: 7, title: "Flexibility Training Concepts" },
  { number: 8, title: "Cardiorespiratory Fitness Training" },
  { number: 9, title: "Core Training Concepts" },
  { number: 10, title: "Balance Training Concepts" },
  { number: 11, title: "Plyometric (Reactive) Training Concepts" },
  { number: 12, title: "Speed, Agility, and Quickness Training" },
  { number: 13, title: "Resistance Training Concepts" },
  { number: 14, title: "Exercise Technique and Spotting" },
  { number: 15, title: "Program Design Concepts" },
  { number: 16, title: "Nutrition" },
  { number: 17, title: "Supplementation" },
  { number: 18, title: "Lifestyle Modification and Behavioral Coaching" },
  { number: 19, title: "Special Populations" },
  { number: 20, title: "Professional Development and Responsibility" },
];

const CHAPTER_STARTERS: Record<number, string[]> = {
  1: [
    "Can you walk me through the 5 phases of the OPT model and explain why they're in that specific order?",
    "Why do you think NASM requires ALL clients to start in Phase 1, even if they're already fit?",
    "What does 'integrated training' actually mean, and how is it different from just doing a workout?",
    "If a client says they only want to lift heavy, how would you use the OPT model to explain your programming?",
    "What makes the OPT model 'evidence-based' rather than just another training system?",
  ],
  2: [
    "Can you explain what happens at the neuromuscular junction when your brain decides to move your arm?",
    "If Type I fibers are recruited first, what does that tell us about how we should warm up?",
    "What's actually happening inside a muscle fiber when it contracts — can you walk through the sliding filament theory?",
    "Why do you think eccentric contractions can produce more force than concentric ones?",
    "How does the size principle affect the way we design training programs for different goals?",
  ],
  3: [
    "If cardiac output equals heart rate times stroke volume, what happens to each variable when you start exercising?",
    "Why does NASM use the Karvonen formula instead of just a percentage of max heart rate?",
    "Can you explain why someone with a higher VO2 max would have better endurance?",
    "What determines which energy system your body primarily uses during exercise?",
    "How does blood pressure respond during resistance training versus cardio?",
  ],
  4: [
    "If all three energy systems are always active, what determines which one is 'in charge' at any moment?",
    "Why do short, intense exercises like sprints make you breathe hard AFTER you stop?",
    "Can you trace the path of a glucose molecule from digestion to becoming ATP?",
    "Why does fat provide more ATP per molecule but carbs are preferred for high-intensity work?",
    "How would understanding energy systems change the way you design rest intervals?",
  ],
  5: [
    "If I asked you to identify all the muscle roles during a push-up, where would you start?",
    "Why does a tight hip flexor often lead to low back pain — can you trace that through the kinetic chain?",
    "What's the practical difference between a synergist and a stabilizer during a bench press?",
    "How does the length-tension relationship explain why posture affects strength?",
    "Can you give me an example of a force-couple and explain why both muscles need to work together?",
  ],
  6: [
    "If you see a client's knees cave inward during an overhead squat, can you trace what's happening muscularly?",
    "Why do we observe the overhead squat from three different views instead of just one?",
    "What's the difference between a compensation and an injury, and why does that matter for a trainer?",
    "If a client shows excessive forward lean in the OHSA, what would your corrective strategy look like?",
    "Why does NASM insist on subjective assessments before any physical testing?",
  ],
  7: [
    "Can you explain the difference between autogenic inhibition and reciprocal inhibition using a real example?",
    "Why does NASM pair SMR with static stretching in Phase 1 but switch to dynamic stretching in later phases?",
    "If foam rolling doesn't physically break up tissue, how does it actually reduce muscle tension?",
    "When would static stretching be counterproductive, and why?",
    "How would you design a flexibility warm-up for a client in Phase 3 of the OPT model?",
  ],
  8: [
    "Why does NASM start deconditioned clients in Stage I instead of jumping to intervals?",
    "How would you explain heart rate zones to a client who has never used a heart rate monitor?",
    "What's the relationship between the three cardio stages and the OPT model phases?",
    "If a client can hold a conversation during their workout, what does that tell you about their training zone?",
    "How would you progress a client from Stage I to Stage II — what markers would you look for?",
  ],
  9: [
    "Why does NASM define the core as more than just the abdominal muscles?",
    "Can you explain the difference between the drawing-in maneuver and bracing — when would you use each?",
    "Why is core stabilization the foundation before adding core strength or power exercises?",
    "How does a weak core affect movements in the upper and lower body?",
    "If a client can hold a plank for 2 minutes, does that mean their core is 'strong enough' to progress?",
  ],
  10: [
    "Why does NASM include balance training for all clients, not just older adults?",
    "How do the visual, vestibular, and somatosensory systems work together to maintain balance?",
    "What happens to your balance if you close your eyes — and what does that tell us about sensory reliance?",
    "How would you progress a balance exercise for a client who has mastered single-leg stance?",
    "Why is a hop-to-stabilization considered a power balance exercise?",
  ],
  11: [
    "Can you explain the stretch-shortening cycle using the example of jumping as high as you can?",
    "Why does a longer amortization phase reduce power output — what's happening to the stored energy?",
    "Why does NASM require clients to master landing mechanics before progressing plyometric intensity?",
    "How is reactive stabilization training different from just doing a jump?",
    "What's the connection between plyometric training and real-world activities like catching yourself from a trip?",
  ],
  12: [
    "What's the practical difference between speed, agility, and quickness — can you give a real-world example of each?",
    "Why does NASM emphasize deceleration training before acceleration training?",
    "How would you make a case to a non-athlete client about why SAQ training matters for them?",
    "If speed equals stride rate times stride length, how would you train each component?",
    "Why do most non-contact ACL injuries happen during deceleration or direction change?",
  ],
  13: [
    "Why does Phase 1 use a 4/2/1 tempo — what adaptation is that specifically targeting?",
    "Can you explain why a client who can bench 300 lbs still needs stabilization training?",
    "How does the SAID principle guide your exercise selection for different client goals?",
    "Walk me through how GAS explains why periodization is necessary.",
    "What's the difference between training for hypertrophy versus maximal strength in terms of programming?",
  ],
  14: [
    "Why does NASM recommend performing compound exercises before isolation exercises in a session?",
    "What are the key things a spotter should communicate before a set begins?",
    "Can you explain why breathing mechanics matter during resistance training?",
    "When might the Valsalva maneuver actually be appropriate, and why is it usually discouraged?",
    "How would you decide whether to use a machine or free weight version of an exercise for a specific client?",
  ],
  15: [
    "Why does NASM prescribe a specific order of components within a single training session?",
    "How would you modify a Phase 1 program for a client who only has 30 minutes to train?",
    "What factors would make you keep a client in a phase longer than 4 weeks?",
    "What's the practical difference between linear and undulating periodization?",
    "How do assessment results directly influence your program design decisions?",
  ],
  16: [
    "Why does NASM place such strong emphasis on scope of practice when it comes to nutrition?",
    "How would you explain the concept of energy balance to a client who just wants to 'lose weight'?",
    "Why is dietary fat essential even for clients trying to lose body fat?",
    "If a client asks you to recommend a specific diet, how would you handle that conversation?",
    "How does understanding RMR help you have realistic conversations about caloric needs?",
  ],
  17: [
    "Why is it important for trainers to understand that supplements aren't regulated like drugs?",
    "What evidence would you look for before recommending any supplement to a client?",
    "How would you explain to a client why creatine is one of the few well-supported supplements?",
    "What's the significance of third-party testing certifications on supplement labels?",
    "If a client brings in a new supplement and asks your opinion, how would you evaluate it?",
  ],
  18: [
    "How would you approach a client who says they want to get fit but has failed to start three times before?",
    "Can you identify which stage of change a client is in based on what they say?",
    "What's the difference between motivational interviewing and just telling someone to 'stay motivated'?",
    "How would you build self-efficacy in a client who doesn't believe they can stick with exercise?",
    "Why does NASM consider relapse a normal part of behavior change rather than a failure?",
  ],
  19: [
    "Why does NASM recommend resistance training for older adults when many people think they should 'take it easy'?",
    "What special considerations do you need when training a pregnant client?",
    "How would you modify a standard Phase 1 program for a client with hypertension?",
    "Why is blood glucose monitoring so important when training clients with diabetes?",
    "What's different about training youth compared to adults?",
  ],
  20: [
    "Where exactly is the line between general nutrition guidance and prescribing a diet?",
    "Why is informed consent more than just a piece of paper — what does it actually protect?",
    "How would you handle a situation where a client asks for something outside your scope of practice?",
    "What's the practical difference between being an independent contractor and an employee as a trainer?",
    "Why does NASM emphasize business skills alongside technical training knowledge?",
  ],
};

const GENERAL_STARTERS = [
  "Explain the OPT model and why it matters for the exam",
  "What muscles are tested most on the NASM exam?",
  "How do I remember all the assessment compensations?",
  "What's the difference between stabilization and strength training?",
];

function formatInlineText(
  text: string,
  keyPrefix: string
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, or plain text segments
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // bold
      parts.push(
        <strong key={`${keyPrefix}-b-${match.index}`} className="font-semibold text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // italic
      parts.push(
        <em key={`${keyPrefix}-i-${match.index}`} className="italic text-gray-200">
          {match[3]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

function formatContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let numberedListCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Numbered lists
    const numberedMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (numberedMatch) {
      numberedListCount++;
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-gray-400 select-none min-w-[1.2em] text-right">
            {numberedListCount}.
          </span>
          <span>{formatInlineText(numberedMatch[2], `n-${i}`)}</span>
        </div>
      );
      continue;
    } else {
      numberedListCount = 0;
    }

    // Bullet points
    if (line.match(/^[\s]*[-•]\s/)) {
      const bulletContent = line.replace(/^[\s]*[-•]\s/, "");
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-gray-400 select-none">&bull;</span>
          <span>{formatInlineText(bulletContent, `bl-${i}`)}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="my-1">
          {formatInlineText(line, `p-${i}`)}
        </p>
      );
    }
  }

  return elements;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowChapterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = useCallback(
    async function sendMessage(text: string) {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            ...(selectedChapter ? { chapter: selectedChapter } : {}),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullContent += parsed.text;
                  setStreamingContent(fullContent);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullContent,
          chapter: selectedChapter ?? undefined,
        };

        setMessages([...updatedMessages, assistantMessage]);
        setStreamingContent("");
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Hmm, I hit a snag: ${error.message}. Try again?`
              : "Something went wrong. Give it another shot!",
        };
        setMessages([...updatedMessages, errorMessage]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, selectedChapter]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const currentStarters = selectedChapter
    ? CHAPTER_STARTERS[selectedChapter] || GENERAL_STARTERS
    : GENERAL_STARTERS;

  const selectedChapterData = selectedChapter
    ? CHAPTERS.find((c) => c.number === selectedChapter)
    : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-white text-lg leading-tight">
                NASM Study Coach
              </h1>
              <p className="text-xs text-gray-400">
                Socratic tutor for your CPT exam
              </p>
            </div>
          </div>

          {/* Chapter selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-sm text-gray-200 hover:bg-gray-700/80 hover:border-gray-600 transition-colors active:scale-[0.99]"
            >
              <span className="truncate">
                {selectedChapterData
                  ? `Ch. ${selectedChapterData.number}: ${selectedChapterData.title}`
                  : "General NASM Tutor"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showChapterDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showChapterDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto rounded-lg bg-gray-800 border border-gray-700 shadow-xl">
                <button
                  onClick={() => {
                    setSelectedChapter(null);
                    setShowChapterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-700 transition-colors ${
                    !selectedChapter
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-200"
                  }`}
                >
                  General NASM Tutor
                </button>
                {CHAPTERS.map((ch) => (
                  <button
                    key={ch.number}
                    onClick={() => {
                      setSelectedChapter(ch.number);
                      setShowChapterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-700 transition-colors border-t border-gray-700/50 ${
                      selectedChapter === ch.number
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-gray-200"
                    }`}
                  >
                    <span className="text-gray-500 mr-1.5">
                      Ch. {ch.number}
                    </span>
                    {ch.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.063 2.348m0-16.306A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6.063 2.348m0-16.306v16.306" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2 text-center">
                {selectedChapter
                  ? `Chapter ${selectedChapter}: ${selectedChapterData?.title}`
                  : "Ready to crush your NASM exam?"}
              </h2>
              <p className="text-gray-400 text-center text-sm mb-8 max-w-md">
                {selectedChapter
                  ? "Let's dive into this chapter. Pick a question below or ask your own."
                  : "Select a chapter above to get focused help, or ask me anything about the NASM CPT material."}
              </p>
              <div className="grid grid-cols-1 gap-2.5 w-full max-w-lg">
                {currentStarters.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="text-left px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 text-sm hover:bg-gray-700/60 hover:border-gray-600 transition-colors active:scale-[0.98] leading-relaxed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id}>
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                      : "bg-gray-800/80 border border-gray-700/40 text-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && msg.chapter && (
                    <div className="mb-2">
                      <span className="inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        Ch. {msg.chapter}
                      </span>
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed">
                      {formatContent(msg.content)}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>

              {/* Action buttons after assistant messages */}
              {msg.role === "assistant" &&
                idx === messages.length - 1 &&
                !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-1">
                    <button
                      onClick={() =>
                        sendMessage(
                          "Test me on what we just discussed. Give me an exam-style question and let me try to answer before you reveal the answer."
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 hover:border-gray-600 transition-colors active:scale-95"
                    >
                      Test me on this
                    </button>
                    <button
                      onClick={() =>
                        sendMessage(
                          "Can you explain that in simpler terms? Use a basic analogy that anyone could understand."
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 hover:border-gray-600 transition-colors active:scale-95"
                    >
                      Explain simpler
                    </button>
                    <button
                      onClick={() =>
                        sendMessage(
                          "How will NASM test me on this? Show me the types of exam questions I should expect and the common traps to watch for."
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 hover:border-gray-600 transition-colors active:scale-95"
                    >
                      How will NASM test this?
                    </button>
                  </div>
                )}
            </div>
          ))}

          {/* Streaming response */}
          {isLoading && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-gray-800/80 border border-gray-700/40 text-gray-100">
                {selectedChapter && (
                  <div className="mb-2">
                    <span className="inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      Ch. {selectedChapter}
                    </span>
                  </div>
                )}
                <div className="text-sm leading-relaxed">
                  {formatContent(streamingContent)}
                  <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle rounded-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator when no content streamed yet */}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-gray-700/40 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedChapter
                ? `Ask about Chapter ${selectedChapter}...`
                : "Ask me anything about NASM CPT..."
            }
            rows={1}
            className="flex-1 resize-none rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] max-h-[120px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
