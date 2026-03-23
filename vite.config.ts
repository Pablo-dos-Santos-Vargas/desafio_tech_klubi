import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "http";
import { askOpenAI, type ChatTurn } from "./src/server/openaiChat";
import type { Car } from "./src/types";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "dev-api-chat",
      configureServer(server) {
        server.middlewares.use("/api/chat", async (req: IncomingMessage & { body?: any }, res: any) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          try {
            const raw = await new Promise<string>((resolve, reject) => {
              let data = "";
              req.on("data", (chunk) => {
                data += chunk;
              });
              req.on("end", () => resolve(data));
              req.on("error", reject);
            });

            const body = raw ? JSON.parse(raw) : {};
            const messages = (body?.messages ?? []) as ChatTurn[];
            const cars = (body?.cars ?? []) as Car[];

            const reply = await askOpenAI(messages, cars);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ reply }));
          } catch {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Falha no endpoint /api/chat" }));
          }
        });
      },
    },
  ],
});
