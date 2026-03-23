import "dotenv/config";
import OpenAI from "openai";
import type { Car } from "../types";
import { buildSystemMessage, fallbackReply } from "../lib/assistant";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const CONSORCIO_URL = "https://klubi.com.br/consorcio/auto";

function getLastUser(history: ChatTurn[]): string {
  return [...history].reverse().find((m) => m.role === "user")?.content ?? "";
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripConsorcioLine(text: string): string {
  const url = escapeRegExp(CONSORCIO_URL);
  return text.replace(new RegExp(`\\n?Consórcio Klubi:\\s*"?${url}"?\\s*`, "g"), "").trim();
}

export async function askOpenAI(history: ChatTurn[], cars: Car[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const lastUser = getLastUser(history);

  if (!apiKey) {
    return fallbackReply(lastUser, cars);
  }

  const client = new OpenAI({ apiKey });

  const systemMessage = buildSystemMessage(JSON.stringify(cars));

  const messages = [
    { role: "system" as const, content: systemMessage },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
    });

    const aiReply = res.choices?.[0]?.message?.content?.trim();
    if (!aiReply) {
      return fallbackReply(lastUser, cars);
    }

    let finalReply = aiReply;

    if (!finalReply.includes(CONSORCIO_URL)) {
      finalReply = `${finalReply}\n\nConsórcio Klubi: "${CONSORCIO_URL}"`;
    }

    const hasPrices = /R\$\s*\d/.test(finalReply);
    if (!hasPrices) {
      const grounded = fallbackReply(lastUser, cars);
      const groundedWithoutConsorcio = stripConsorcioLine(grounded);
      finalReply = `${finalReply}\n\n${groundedWithoutConsorcio}`;
    }

    return finalReply;
  } catch {
    const finalReply = fallbackReply(lastUser, cars);
    return finalReply;
  }

  return fallbackReply(lastUser, cars);
}

