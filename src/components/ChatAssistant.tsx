import { useEffect, useRef, useState } from "react";
import type { Car } from "../types";
import { prompt } from "../lib/assistant";
import { askAssistant, type ChatTurn } from "../lib/chatClient";

type Msg = { id: string; role: "user" | "assistant"; content: string };

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatAssistant({ cars }: { cars: Car[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", role: "assistant", content: prompt },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const user: Msg = { id: id(), role: "user", content: text };
    setMessages((m) => [...m, user]);
    setLoading(true);
    const history: ChatTurn[] = [...messages, user].map(({ role, content }) => ({ role, content }));
    try {
      const reply = await askAssistant(history, cars);
      setMessages((m) => [...m, { id: id(), role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="chat-fab" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="chat-fab__icon" aria-hidden>
          ✦
        </span>
        <span className="chat-fab__label">Assistente</span>
      </button>

      {open ? (
        <div className="chat-panel" role="dialog" aria-label="Assistente Klubi">
          <div className="chat-panel__head">
            <h2 className="chat-panel__title">Assistente Klubi</h2>
            <div className="chat-panel__head-actions">
              <button
                type="button"
                className="chat-panel__ghost"
                onClick={() => setMessages([{ id: id(), role: "assistant", content: prompt }])}
              >
                Limpar
              </button>
              <button type="button" className="chat-panel__close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>
          </div>

          <div className="chat-panel__banner">
            <a className="chat-panel__cta-klubi" href={"https://klubi.com.br/consorcio/auto"} target="_blank" rel="noopener noreferrer">
              Fazer consórcio no Klubi
            </a>
          </div>

          <div className="chat-panel__messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
                <div className="chat-msg__pre">{m.content}</div>
              </div>
            ))}
            {loading ? <div className="chat-msg chat-msg--assistant chat-msg--typing">…</div> : null}
          </div>

          <form
            className="chat-panel__form"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              type="text"
              placeholder="Sua pergunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Mensagem"
            />
            <button type="submit" className="chat-panel__send" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
