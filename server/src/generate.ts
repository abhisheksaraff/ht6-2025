import { Context } from "hono";
import { IGeminiClient } from "./gemini";
import { Content } from "@google/genai";
import { SSEStreamingApi, streamSSE } from "hono/streaming";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export class Generate {
  private geminiClient: IGeminiClient;
  constructor(geminiClient: IGeminiClient) {
    this.geminiClient = geminiClient;
  }

  async post(c: Context<{ Bindings: Env }>): Promise<Response> {
    const { contents, search } = await c.req.json<{ contents: string[]; search: boolean }>();
    if (!contents) {
      return c.json({ error: "Invalid input" }, 400);
    }
    if (!Array.isArray(contents) || contents.length === 0) {
      return c.json({ error: "Contents must be a non-empty array" }, 400);
    }

    const contentsList = await Promise.all(contents.map(async (content) => {
      const contentData = await c.env.CONTENT.get(content, "json") as Content | null;
      if (!contentData) {
        throw new Error(`Content with ID ${content} not found`);
      }
      return contentData;
    }));
    const generator = await this.geminiClient.generateText(contentsList[0], contentsList.slice(1), search);
    // Process the stream
    const streamer = async (streamObj: SSEStreamingApi) => {
      for await (const chunk of generator) {
        if (!chunk.text) {
          continue;
        }
        // Write to the stream
        await streamObj.writeSSE({
          data: chunk.text,
          event: "message",
        });
      }
    }
    return streamSSE(c, streamer, async (e, stream) => {
      console.error("Error in streaming:", e);
      await stream.writeSSE({
        data: JSON.stringify(e),
        event: "error",
      });
    });
  }

  async options(c: Context): Promise<Response> {
    return c.json({}, undefined, corsHeaders);
  }
}

