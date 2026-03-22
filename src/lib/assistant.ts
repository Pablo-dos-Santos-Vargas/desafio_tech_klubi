import type { Car } from "../types";
import { formatBRL } from "./search";


export const prompt = `Sou a Kris assistente virtual do Klubi.

Estou aqui para te ajudar a conquistar o seu carro com o Klubi: "https://klubi.com.br/consorcio/auto"`;

export function buildSystemMessage(catalogJson: string): string {
  return `Assistente Klubi — busca de carros.

Regras:
- Só use veículos do JSON abaixo. Não invente modelo, preço ou cidade.
- Campos: Name, Model, Price (reais), Location, Image.
- Português (Brasil), objetivo. Sugira consórcio no Klubi quando couber: "https://klubi.com.br/consorcio/auto"

Catálogo completo:
${catalogJson}`;
}

export function fallbackReply(lastQuestion: string, cars: Car[]): string {
  const q = lastQuestion.toLowerCase();
  const hit = cars.filter((c) => {
    const blob = `${c.Name} ${c.Model} ${c.Location}`.toLowerCase();
    return q.length < 2 || blob.includes(q) || q.split(/\s+/).some((w) => w.length > 2 && blob.includes(w));
  });
  const pick = (hit.length ? hit : cars).slice(0, 4);
  const lines = pick.map(
    (c) => `• ${c.Name} ${c.Model} — ${formatBRL(c.Price)} · ${c.Location}`
  );
  return `Algumas opções do catálogo:\n\n${lines.join("\n")}\n\nConsórcio Klubi: "https://klubi.com.br/consorcio/auto"`;
}
