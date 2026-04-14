"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "Explain the OPT model",
  "What muscles are tested most on the exam?",
  "How do I remember all the assessment compensations?",
  "What's the difference between stabilization and strength training?",
];

function formatContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Bold: **text**
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${i}-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    // Bullet points
    if (line.match(/^[\s]*[-•]\s/)) {
      const bulletContent = line.replace(/^[\s]*[-•]\s/, "");
      const bulletParts: React.ReactNode[] = [];
      const bRegex = /\*\*(.*?)\*\*/g;
      let bLast = 0;
      let bMatch;
      while ((bMatch = bRegex.exec(bulletContent)) !== null) {
        if (bMatch.index > bLast) {
          bulletParts.push(bulletContent.slice(bLast, bMatch.index));
        }
        bulletParts.push(
          <strong key={`bb-${i}-${bMatch.index}`} className="font-semibold">
            {bMatch[1]}
          </strong>
        );
        bLast = bMatch.index + bMatch[0].length;
      }
      if (bLast < bulletContent.length) {
        bulletParts.push(bulletContent.slice(bLast));
      }

      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="text-gray-400 select-none">&bull;</span>
          <span>{bulletParts.length > 0 ? bulletParts : bulletContent}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="my-1">
          {parts.length > 0 ? parts : line}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
      };

      setMessages([...updatedMessages, assistantMessage]);
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
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h1 className="font-semibold text-white text-lg leading-tight">
              NASM Study Coach
            </h1>
            <p className="text-xs text-gray-400">
              Your personal CPT exam tutor
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-4xl mb-4">💪</div>
              <h2 className="text-xl font-semibold text-white mb-2 text-center">
                Hey! Ready to crush your NASM exam?
              </h2>
              <p className="text-gray-400 text-center text-sm mb-8 max-w-md">
                Ask me anything about the NASM CPT material. I can explain
                concepts, quiz you, share exam tips, or help you work through
                tricky topics.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {STARTER_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="text-left px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-300 text-sm hover:bg-gray-700/60 hover:border-gray-600 transition-colors active:scale-[0.98]"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-gray-800 text-gray-100 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="text-sm leading-relaxed">
                    {formatContent(msg.content)}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
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
            placeholder="Ask me anything about NASM CPT..."
            rows={1}
            className="flex-1 resize-none rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] max-h-[120px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors active:scale-95"
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
