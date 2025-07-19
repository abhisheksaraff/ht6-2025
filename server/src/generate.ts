import { Context } from "hono";
import { IGeminiClient } from "./gemini";
import { IMongoClient } from "./mongo";
import { Content, ContentUnion } from "@google/genai";
import { SSEStreamingApi, streamSSE } from "hono/streaming";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export class Generate {
  private mongoClient: IMongoClient;
  private geminiClient: IGeminiClient;
  constructor(mongoClient: IMongoClient, geminiClient: IGeminiClient) {
    this.mongoClient = mongoClient;
    this.geminiClient = geminiClient;
  }

  async post(c: Context): Promise<Response> {
    const { systemInstruction, contents, search } = await c.req.json<{ systemInstruction: string; contents: string[]; search: boolean }>();
    if (!systemInstruction || !contents) {
      return c.json({ error: "Invalid input" }, 400);
    }

    const systemInstructionContent = await this.mongoClient.load<ContentUnion>(systemInstruction)
    if (!systemInstructionContent) {
      return c.json({ error: "System instruction not found" }, 404);
    }
    await this.mongoClient.connect(c.env.MONGO_CONN_STRING);
    try {
      const contentsList = await Promise.all(contents.map(async (content) => {
        const contentData = await this.mongoClient.load<Content>(content);
        if (!contentData) {
          throw new Error(`Content with ID ${content} not found`);
        }
        return contentData;
      }));
      const generator = await this.geminiClient.generateText(systemInstructionContent, contentsList, search);

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
    finally {
      await this.mongoClient.disconnect();
    }
  }

  async options(c: Context): Promise<Response> {
    return c.json({}, undefined, corsHeaders);
  }
}

