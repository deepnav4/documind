import { openrouter } from "@openrouter/ai-sdk-provider";
import { embed } from "ai";
import { prisma } from "@/prisma/src/index";

type TRequest = {
    query: string;
    document_id: string;
}
export async function POST(req: Request) {
    try {
        const { query, document_id } : TRequest = await req.json();

        if (!query || !document_id) {
            return Response.json({ error: "Missing query or document_id" }, { status: 400 });
        }

        console.log(`Generating query embedding for Document: ${document_id}`);

        console.log(`[RAG] 1. Starting Embedding Generation via OpenRouter...`);

        const { embedding: queryEmbedding } = await embed({
            model: openrouter.textEmbeddingModel("nvidia/llama-nemotron-embed-vl-1b-v2:free"),
            value: query,
            maxRetries: 0
        });

        console.log(`[RAG] 2. Embedding success!`);
        console.log(`[RAG] 3. Querying Neon DB via Prisma pgvector...`);
        
        const stringifiedVector = JSON.stringify(queryEmbedding);

        const relevantChunks: Array<{
             id: string;
             text: string;
             metadata: any;
             similarity: number;
        }> = await prisma.$queryRaw`
            SELECT 
                id, 
                text, 
                metadata, 
                1 - (embedding <=> ${stringifiedVector}::vector) as similarity
            FROM "DocumentChunk"
            WHERE document_id = ${document_id}
            ORDER BY embedding <=> ${stringifiedVector}::vector
            LIMIT 5;
        `;

        const MINIMUM_SIMILARITY = 0.05;
        const topResults = relevantChunks.filter((chunk) => chunk.similarity > MINIMUM_SIMILARITY);

        return Response.json({
            message: "Relevant document chunks found",
            chunks: topResults
        });

    } catch (error) {
        console.error("Error in semantic search:", error);
        return Response.json({
            error: "Failed to perform semantic search on DB"
        }, { status: 500 });
    }
}