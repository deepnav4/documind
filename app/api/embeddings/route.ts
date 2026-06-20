import { openrouter } from "@openrouter/ai-sdk-provider";
import { embed } from "ai";

export async function POST(req: Request) {
    try {
        const {text} = await req.json();
        const {embedding, usage, value} =await embed({
        model: openrouter.textEmbeddingModel("nvidia/llama-nemotron-embed-vl-1b-v2:free"),
        value: text,

    })

    return Response.json({
        embedding,
        usage,
        value,
        text: text,
        dimension: embedding.length
    })
    } catch(error) {
        console.error("error while generating embedding", error);
        return Response.json({error: "error while generating embedding"}, {status: 500})
    }
}