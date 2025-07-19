import {
  ContentUnion,
  createModelContent,
  createUserContent,
} from "@google/genai";
import { Context } from "hono";
import { v7 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const post = async (c: Context<{ Bindings: Env }>) => {
  const { content, role } = await c.req.json<{
    content: string;
    role: "user" | "assisstant" | "system";
  }>();

  const id = v7();
  const ttl = 10 * 60;
  const result = getContentFromRole(content, role);

  await c.env.CONTENT.put(id, result.toString(), {
    expirationTtl: ttl,
  });

  return c.json({ id, ttl }, 200, corsHeaders);
};

const put = async (c: Context<{ Bindings: Env }>) => {
  const { id, content, role } = await c.req.json<{
    id: string;
    content: string;
    role: "user" | "assisstant" | "system";
  }>();

  const ttl = 10 * 60;

  if (!content || !role) {
    const content = await c.env.CONTENT.get(id);
    if (!content) throw new Error("No content found");
    await c.env.CONTENT.put(id, content, { expirationTtl: ttl });
  } else {
    const result = getContentFromRole(content, role);
    await c.env.CONTENT.put(id, result.toString(), {
      expirationTtl: ttl,
    });
  }

  return c.json({ id, ttl }, 200, corsHeaders);
};

const getContentFromRole = (content: string, role: string): ContentUnion => {
  switch (role) {
    case "user":
      return createUserContent(content);
      break;
    case "assisstant":
      return createModelContent(content);
      break;
    case "system":
      return content;
      break;
    default:
      throw new Error("Illegal Role");
  }
};

const options = (c: Context) => {
  return c.json({}, undefined, corsHeaders);
};

export { post, put, options };
