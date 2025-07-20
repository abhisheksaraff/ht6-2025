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

  async get(c: Context<{ Bindings: Env }>): Promise<Response> {
    const url = new URL(c.req.url);
  const allContents = url.searchParams.getAll("contents");
  const search = url.searchParams.get("search") === "true";

  const contents = Array.isArray(allContents) ? allContents : [allContents];

  if (!contents || contents.length === 0) {
    return c.json({ error: "Contents must be a non-empty array" }, 400);
  }

  const contentsList = await Promise.all(
    contents.map(async (content) => {
      const contentData = (await c.env.CONTENT.get(content, "json")) as Content | null;
      if (!contentData) {
        throw new Error(`Content with ID ${content} not found`);
      }
      return contentData;
    })
  );

  const generator = await this.geminiClient.generateText(
    contentsList[0],
    contentsList.slice(1),
    search
  );
    // Process the stream
    const streamer = async (streamObj: SSEStreamingApi) => {
      for await (const chunk of generator) {
        if (!chunk.text) {
          continue;
        }
        console.log("chunk",chunk.text)
        // Write to the stream
        await streamObj.writeSSE({
          data: chunk.text,
          event: "message",
        });
      }
    };
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    //c.header("Connection", "keep-alive");
    c.header("Access-Control-Allow-Origin", "*");

    return streamSSE(c, streamer, async (e, stream) => {
      console.error("Error in streaming:", e);
      await stream.writeSSE({
        data: JSON.stringify(e),
        event: "error",
      });
    });

    // return c.stream(async (e, stream) => {
    //   console.error("Error in streaming:", e);
    //   await stream.writeSSE({
    //     data: JSON.stringify(e),
    //     event: "error",
    //   });
    // });
  }

  async options(c: Context): Promise<Response> {
    return c.json({}, undefined, corsHeaders);
  }
}
