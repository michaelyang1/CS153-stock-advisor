import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/persona";
import { advisorTools } from "@/lib/tools";
import { resolveAdvisorModel } from "@/lib/model";

export const maxDuration = 60;

const cfg = resolveAdvisorModel();

const model =
  cfg.provider === "openrouter"
    ? createOpenRouter({
        apiKey: process.env.OPENROUTER_CS153_API_KEY,
        appName: "Atlas Frontier",
        appUrl: "https://cs153-stock-advisor.vercel.app",
      }).chat(cfg.modelId)
    : anthropic(cfg.modelId);

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model,
    system: PERSONA_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: advisorTools,
    stopWhen: stepCountIs(6),
    temperature: 0.85,
  });

  return result.toUIMessageStreamResponse();
}
