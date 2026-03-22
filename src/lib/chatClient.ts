import type { Car } from "../types";
import { fallbackReply } from "./assistant";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askAssistant(history: ChatTurn[], cars: Car[]): Promise<string> {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, cars }),
    });
    if (res.ok) {
      const data = (await res.json()) as { reply?: string };
      if (data.reply) return data.reply;
    }
  } catch {
  }

  return fallbackReply(lastUser, cars);
}
