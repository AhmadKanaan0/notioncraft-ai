import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { prompt, type } = await req.json();

        let systemPrompt = "";
        switch (type) {
            case 'improve':
                systemPrompt = "You are a writing assistant. Improve the given text while maintaining its meaning. Make it clearer, more concise, and more engaging. Only respond with the improved text, no explanations.";
                break;
            case 'shorter':
                systemPrompt = "You are a writing assistant. Make the given text shorter and more concise while keeping the main points. Only respond with the shortened text, no explanations.";
                break;
            case 'longer':
                systemPrompt = "You are a writing assistant. Expand the given text with more detail, examples, or explanations while maintaining the original meaning. Only respond with the expanded text, no explanations.";
                break;
            case 'grammar':
                systemPrompt = "You are a writing assistant. Fix any grammar, spelling, and punctuation errors in the given text. Only respond with the corrected text, no explanations.";
                break;
            case 'professional':
                systemPrompt = "You are a writing assistant. Rewrite the given text in a professional, formal tone suitable for business communication. Only respond with the rewritten text, no explanations.";
                break;
            case 'カジュアル':
                systemPrompt = "You are a writing assistant. Rewrite the given text in a casual, friendly tone. Only respond with the rewritten text, no explanations.";
                break;
            default:
                systemPrompt = "You are a writing assistant integrated into a Notion-like editor. Generate content based on the user's prompt. Be helpful and concise.";
        }

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            prompt: prompt,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Writer API error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
