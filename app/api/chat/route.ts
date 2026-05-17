import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/persona";
import { advisorTools } from "@/lib/tools";

export const maxDuration = 60;

const MODEL_ID = process.env.ADVISOR_MODEL ?? "claude-sonnet-4-5";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: PERSONA_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: advisorTools,
    stopWhen: stepCountIs(6),
    temperature: 0.85,
  });

  return result.toUIMessageStreamResponse();
}
