import { openrouter } from "@openrouter/ai-sdk-provider";
import { embed, embedMany } from "ai";

export async function POST(req: Request) {
    try {
        const {text} = await req.json();
        const embeddings = await embedMany({
            model: openrouter.textEmbeddingModel("nvidia/llama-nemotron-embed-vl-1b-v2:free"),
            values: text,
        })

        return Response.json({
            embeddings
        })
    } catch (error) {
        console.error("Something went wrong while generting embeddings", error);
        return Response.json({
            error: "Something went wrong while generting embeddings"
        }, {status: 500})
    }
}