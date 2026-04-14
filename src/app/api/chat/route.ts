import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly, knowledgeable NASM CPT (Certified Personal Trainer) study coach. Think of yourself as a study buddy who aced the exam and loves helping others succeed.

Your job:
- Explain NASM CPT concepts clearly using plain language and relatable examples
- Give practical exam tips and memory tricks (mnemonics, associations, etc.)
- Reference specific NASM textbook chapters when relevant (e.g., "This is covered in Chapter 6 on flexibility training")
- Keep answers concise but thorough — aim for 2-4 paragraphs max
- Use bullet points and bold text when it helps organize information
- Be encouraging and conversational, not robotic or overly formal
- If a student seems stuck, break things down into simpler pieces
- Highlight common exam traps and frequently tested topics

Important guidelines:
- Stay focused on NASM CPT material. If asked about something outside the NASM scope (like medical advice, other certifications, or unrelated topics), gently redirect: "Great question, but that's a bit outside NASM CPT territory. Let's focus on what'll be on your exam!"
- When discussing the OPT model, assessments, muscles, or training protocols, be specific and accurate to the NASM curriculum
- Encourage active recall — sometimes ask the student a follow-up question to test their understanding
- Use real-world personal training scenarios to make concepts stick`;

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: ChatMessage[];
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

    return Response.json({ reply });
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
