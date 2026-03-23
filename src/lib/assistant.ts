import type { Car } from "../types";
import { formatBRL } from "./search";


export const prompt = `Sou a Kris assistente virtual do Klubi.

Estou aqui para te ajudar a conquistar o seu carro com o Klubi: "https://klubi.com.br/consorcio/auto"`;

export function buildSystemMessage(catalogJson: string): string {
  return `Assistente Klubi — busca de carros.

Regras:
- Só use veículos do JSON abaixo. Não invente modelo, preço ou cidade.
- Campos: Name, Model, Price (reais), Location.
- Português (Brasil), objetivo.
- Ao mencionar veículos, use EXATAMENTE Model, Price e Location do catálogo (não invente nem altere valores).
- Sempre inclua o consórcio Klubi ao final da resposta: "https://klubi.com.br/consorcio/auto"

- Comportamento iterativo: use o histórico da conversa para manter as preferências do usuário (modelo/cidade/orçamento) já informadas.
- Se faltarem dados para sugerir com precisão (ex: cidade ou teto de preço), faça 1 pergunta objetiva e aguarde a resposta antes de concluir.
- Se o usuário corrigir/atualizar algo em um turno seguinte, replique as sugestões com base na atualização.

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
