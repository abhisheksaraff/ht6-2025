import { Hono } from "hono";
import { UUID } from "mongodb";

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
app.post("/api/content", (c) => {
  return c.text("Hello Hono!");
});

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
app.put("/api/content", (c) => {
  return c.text("Hello Hono!");
});

app.options("/api/content", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/generate", (c) => {
  return c.text("Hello Hono!");
});

export default app;
