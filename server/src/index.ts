import { Hono } from "hono";
import { postContent, putContent, optionsContent } from "./contentController";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post("/api/content", postContent);

app.put("/api/content", putContent);

app.options("/api/content", optionsContent);

app.post("/api/generate", (c) => {
  return c.text("Hello Hono!");
});

export default app;
