import { Hono } from "hono";
import { post, put, options } from "./contentController";
import { Generate } from "./generate";
import { GeminiClient } from "./gemini";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/content", post);
app.put("/api/content", put);
app.options("/api/content", options);

app.post("/api/generate", async (c) => {
  const generate = new Generate(new GeminiClient(c.env.GEMINI_API_KEY));
  return generate.post(c);
});

export default app;
