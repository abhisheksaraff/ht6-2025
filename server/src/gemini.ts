import { ContentUnion, GenerateContentResponse, GoogleGenAI, type ContentListUnion } from "@google/genai";

export interface IGeminiClient {
  generateText: (systemInstruction: ContentUnion, contents: ContentListUnion, search: boolean) => Promise<AsyncGenerator<GenerateContentResponse>>;
}

export class GeminiClient implements IGeminiClient {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateText(systemInstruction: ContentUnion, contents: ContentListUnion, search: boolean): Promise<AsyncGenerator<GenerateContentResponse>> {
    const tools = [];
    if (search) {
      tools.push({ googleSearch: {} });
    }
    return await this.client.models.generateContentStream({
      contents,
      model: "gemini-2.0-flash",
      config: {
        maxOutputTokens: 250,
        tools,
        systemInstruction: systemInstruction
      }
    });
  }
}
