import { streamText, convertToModelMessages, type LanguageModel } from "ai";
import { createMockModel } from "@/lib/mock-provider";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: createMockModel() as unknown as LanguageModel,
    messages: await convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
