import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: "You are a helpful AI assistant integrated into a Notion-like editor. Help users with writing, brainstorming, answering questions, and generating content. Be concise and helpful.",
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
