import Anthropic from "@anthropic-ai/sdk";
import { getChapterContext } from "@/lib/tutor/chapter-context";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const GENERAL_SYSTEM_PROMPT = `You are a friendly, knowledgeable NASM CPT (Certified Personal Trainer) study coach using the Socratic method.

TEACHING APPROACH:
- Use the Socratic method: ask guiding questions before explaining
- Layer explanations: simple analogy first, then technical detail, then exam application
- End every concept with: "Here's how NASM will test you on this: [exam pattern]"
- If the student seems confused, back up and use a simpler analogy
- Be encouraging but honest — if they're wrong, explain why clearly

GUIDELINES:
- Keep responses conversational, 2-4 paragraphs max
- Use examples from real training scenarios
- Use bullet points and bold text when it helps organize information
- Stay focused on NASM CPT material. If asked about something outside the NASM scope, gently redirect
- When discussing the OPT model, assessments, muscles, or training protocols, be specific and accurate to the NASM curriculum
- Encourage active recall — sometimes ask the student a follow-up question to test their understanding`;

function buildChapterSystemPrompt(chapter: number): string {
  const ctx = getChapterContext(chapter);
  if (!ctx) return GENERAL_SYSTEM_PROMPT;

  return `You are a NASM CPT study coach specializing in Chapter ${chapter}: ${ctx.title}.

TEACHING APPROACH:
- Use the Socratic method: ask guiding questions before explaining
- Layer explanations: simple analogy first, then technical detail, then exam application
- End every concept with: "Here's how NASM will test you on this: [exam pattern]"
- If the student seems confused, back up and use a simpler analogy
- Be encouraging but honest — if they're wrong, explain why clearly

CHAPTER CONTEXT:
Key concepts for this chapter:
${ctx.keyConcepts.map((c) => `- ${c}`).join("\n")}

COMMON STUDENT MISCONCEPTIONS FOR THIS CHAPTER:
${ctx.commonMisconceptions.map((m) => `- ${m}`).join("\n")}

EXAM QUESTION PATTERNS:
${ctx.examPatterns.map((p) => `- ${p}`).join("\n")}

GUIDELINES:
- Keep responses conversational, 2-4 paragraphs max
- Use examples from real training scenarios
- Use bullet points and bold text when it helps organize information
- Stay focused on Chapter ${chapter} material but connect to other chapters when it helps understanding
- When a student's question touches on a common misconception listed above, proactively address it
- Encourage active recall — sometimes ask the student a follow-up question`;
}

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, chapter } = body as {
      message: string;
      history: ChatMessage[];
      chapter?: number;
    };

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Anthropic API key is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt =
      chapter && chapter >= 1 && chapter <= 20
        ? buildChapterSystemPrompt(chapter)
        : GENERAL_SYSTEM_PROMPT;

    const messages: { role: MessageRole; content: string }[] = [];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (
          msg.role &&
          msg.content &&
          (msg.role === "user" || msg.role === "assistant")
        ) {
          messages.push({
            role: msg.role as MessageRole,
            content: msg.content,
          });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    if (
      error instanceof Error &&
      "status" in error &&
      (error as { status: number }).status === 401
    ) {
      return Response.json(
        { error: "Invalid API key. Please check your configuration." },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
