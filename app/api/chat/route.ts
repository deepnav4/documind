import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText, embed, convertToModelMessages, tool, stepCountIs } from "ai";
import { any, z } from "zod";
import { prisma } from "@/prisma/src/index";

const ChatRequestSchema = z.object({
    messages: z.array(z.any()),
    document_id: z.string().min(1, "document_id is required"),
    file_url: z.string().optional(),
}).loose();

type TChatRequestSchema = z.infer<typeof ChatRequestSchema>;

const webSearchTool = tool({
  description: "Search the web for up-to-date or general knowledge information not found in the document.",
  
  inputSchema: z.object({
    query: z.string().describe("The search query to find information on the web")
  }),

  execute: async ({ query }): Promise<{ results: string }> => {
    console.log(`[RAG] LLM requested web search for: "${query}"`);
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);

    const data = await res.json();

    const results = [
      data.Abstract,
      ...(data.RelatedTopics?.slice(0, 5).map((r: any) => r.Text) || [])
    ].filter(Boolean);

    return {
      results: results.length > 0
        ? results.join("\n\n")
        : "No useful results found."
    };
  }
});

const knowledgBaseSearchTool = (document_id: string) => tool({
        description: 'Search the PDF document for relevant information based on a query.',
        inputSchema: z.object({
            query: z.string().describe('The search query. Do NOT include page numbers here.'),
            page_number: z.number().optional().describe('CRITICAL: You MUST provide this number if the user asks about a specific page. Do not leave this empty if a page is requested.')
        }),
        execute: (async ({ query, page_number }: { query: string, page_number?: number }) => {
            const safeQuery = query && query !== "undefined" && query.trim() !== "" ? query : "explain page content";
            console.log(`[RAG] LLM requested search for: "${safeQuery}" in Document: ${document_id}${page_number ? ` (Page ${page_number})` : ''}`);
            
            const { embedding: queryEmbedding } = await embed({
                model: openrouter.textEmbeddingModel("nvidia/llama-nemotron-embed-vl-1b-v2:free"),
                value: safeQuery,
            });
            const stringifiedVector = JSON.stringify(queryEmbedding);

            let relevantChunks: Array<{
                 id: string;
                 text: string;
                 metadata: any;
                 similarity: number;
            }>;

            if (page_number !== undefined) {
                console.log("Page number provided: ", page_number);
                relevantChunks = await prisma.$queryRaw`
                    SELECT 
                        id, 
                        text, 
                        metadata, 
                        1 - (embedding <=> ${stringifiedVector}::vector) as similarity
                    FROM "DocumentChunk"
                    WHERE document_id = ${document_id}
                      AND (
                          metadata::jsonb->'page_numbers' @> ( '[' || ${page_number} || ']' )::jsonb
                          OR metadata::jsonb->'loc'->>'pageNumber' = ${page_number.toString()}
                          OR metadata::jsonb->>'page' = ${page_number.toString()}
                      )
                    ORDER BY embedding <=> ${stringifiedVector}::vector
                    LIMIT 15;
                `;
            } else {
                relevantChunks = await prisma.$queryRaw`
                    SELECT 
                        id, 
                        text, 
                        metadata, 
                        1 - (embedding <=> ${stringifiedVector}::vector) as similarity
                    FROM "DocumentChunk"
                    WHERE document_id = ${document_id}
                    ORDER BY embedding <=> ${stringifiedVector}::vector
                    LIMIT 15;
                `;
            }

            const MINIMUM_SIMILARITY = 0.05;
            console.log("Raw relevant chunks from DB:", relevantChunks.length);
            const topResults = relevantChunks.filter((chunk) => {
                if (page_number !== undefined) return true;
                return chunk.similarity > MINIMUM_SIMILARITY;
            });
            console.log("Top results count:", topResults.length);
            console.log("topresults : ", JSON.stringify(topResults,null,2));

            const formattedContexts = topResults.map((chunk, index) => {
                const meta = typeof chunk.metadata === 'string' ? JSON.parse(chunk.metadata) : chunk.metadata;
                
                let pageNumStr = "";
                if (meta?.page_numbers && Array.isArray(meta.page_numbers) && meta.page_numbers.length > 0) {
                    pageNumStr = meta.page_numbers.join(", ");
                } else if (meta?.loc?.pageNumber) {
                    pageNumStr = meta.loc.pageNumber;
                } else if (meta?.page) {
                    pageNumStr = meta.page;
                }

                const page = pageNumStr ? `Page ${pageNumStr}` : `Document`;
                
                let headingStr = "";
                if (meta?.headings && Array.isArray(meta.headings) && meta.headings.length > 0) {
                    headingStr = ` (Headings: ${meta.headings.join(" > ")})`;
                }
                
                return `[Citation ${index + 1}] (Source: ${page})${headingStr}\n${chunk.text}`;
            });

            return { 
                contexts: formattedContexts.length > 0 ? formattedContexts.join("\n\n") : "No relevant context found in document." 
            };
        })
    });

const getTools = (document_id: string) => ({
    search_knowledge_base: knowledgBaseSearchTool(document_id),
    web_search: webSearchTool
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[RAG] Incoming chat body:", JSON.stringify(body, null, 2));
        
        let parsedData;
        try {
            parsedData = ChatRequestSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("[RAG]Validation failed:", error.message);
                return Response.json({ error: "Validation error", details: error.message });
            }
            throw error;
        }

        const { messages, document_id } = parsedData;

        console.log(`[RAG] Starting chat stream for Document: ${document_id}`);

        const result = await streamText({
            // model: openrouter("openai/gpt-4o-mini"),
            model: openrouter("openai/gpt-oss-20b:free"),
            system: SYSTEM_PROMPT,
            messages: convertToModelMessages(messages),
            stopWhen: stepCountIs(3),
            maxRetries: 3,
            tools: getTools(document_id)
        });

        // console.log("Result content:", await (result.content));
        
        return result.toUIMessageStreamResponse({
            sendReasoning: true,
            sendSources: true,
        });
    } catch (error) {
        console.error("Error in RAG chat route:", error);
        return Response.json({
            error: "An error occurred during chat processing"
        }, { status: 500 });
    }
}

const SYSTEM_PROMPT = `You are a helpful and intelligent AI assistant answering questions regarding a specific PDF document.
        You MUST use the 'search_knowledge_base' tool to search the document before answering.

        Guidelines:
        0. Call tools ony when required. And after calling tool you MUST use its response to answer the question. Do not call tool and then answer without its response.
        1. Synthesize your final answer using ONLY the provided sources from the search tool. Do not hallucinate or use outside knowledge.
        2. If the search tool does not return relevant context, politely state that you cannot find the answer in the provided document.
        3. At the very end of your response, ALWAYS include a nicely formatted "Sources" section tracing back your sources to their exact Source Pages. The search tool results will include source page references like [Citation X] (Source: Page Y). Use these to create links like [Page 1](#page=1), [Page 2](#page=2) in sorted manner.
        4. Answer in both bullet points and tables as required and best suited for the answer.
        5. USE the 'search_knowledge_base' tool and send sources when you call tool.
        6. Reply for the basic greetings and introductory questions like 'Hi', 'Hello', 'How are you?', etc. Do not use the search tool for these questions.
        7. When explicitly asked to use web search and when user asks such a question that you feel is just extension of what is related to the pdf but may not be written in it exactly word to word use the web_search tool and then reply, but tell the user that this was not mentioned in the PDF but have been
            searched from the web and also site the sources if possible, use the 'web_search' tool to search the web for the answer, then in that case you can answer using web search result that is necessarily not in the PDF.
        8. CRITICAL: If the user asks about a specific page (e.g. "explain page 2"), you MUST provide that number in the 'page_number' parameter of the search tool. Do NOT just put "page 2" in the search query string.`