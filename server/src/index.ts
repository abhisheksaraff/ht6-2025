import { Hono } from "hono";
import { post, put, options } from "./contentController";
import { Generate } from "./generate";
import { GeminiClient } from "./gemini";
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

app.post("/api/content", post);
app.put("/api/content", put);
app.options("/api/content", options);

app.get("/api/generate", async (c) => {
  const generate = new Generate(new GeminiClient(c.env.GEMINI_API_KEY));
  return generate.get(c);
});

export default app;

// "01982693-94fc-70cc-a9c4-afc2a16a898e",
// "01982693-d4b3-74ef-9568-4c6210be9a0b"
// "01982694-04f2-750d-b1a0-5cc266f0ebd1"