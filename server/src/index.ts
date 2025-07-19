import { Hono } from "hono";
import { post, put, options } from "./contentController";

const app = new Hono<{ Bindings: CloudflareBindings }>();
// env.VARIABLE;
// UUID v7
// ttl 10 * 60
// {
//   content: ""
//   role: "" // user or model or system
// }

// return
// {
//   id: "",
//   ttl: ttl,
// }
app.post("/api/content", post);

// UUID v7
// reset ttl to = 10mins
//{
//   id: "",
//   content: "" optional
// } res.status(200)

// return
// {
//   id: "",
//   ttl: ttl,
// } res.status(200)
app.put("/api/content", put);

app.options("/api/content", options);

app.post("/api/generate", (c) => {
  return c.text("Hello Hono!");
});

export default app;
