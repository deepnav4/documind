import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { mindMapSchema, mindMapSummarySchema } from "./schema";

export const POST = async (req: Request) => {
    try {
        const { pdfFile, phase } = await req.json();

        // 1. Outline phase
        if (phase === "map") {
            const { generateText } = await import("ai");
            const result = await generateText({
                model: openrouter("google/gemini-2.5-flash:free"),
                prompt: pdfFile,
                system: "Extract a structural outline and key concepts from the provided text snippet. Do not skip important keywords, headings, or metadata. Provide a concise, hierarchical text outline that captures the essence of the concepts discussed. Keep it as brief as possible while retaining full structural accuracy."
            });

            return Response.json({
                success: true,
                message: "mind map summary generated",
                summary: result.text
            });
        }

        // 2. Structuring Phase
        const normalizeMindMap = (raw: any): any => {
            if (!raw || typeof raw !== 'object') return null;
            const topic = raw.topic || "Main Concept";
            const mindMap = Array.isArray(raw.mindMap) ? raw.mindMap : [];
            return { topic, mindMap };
        };

        const fallbackMindMap = (): any => {
            return {
                topic: "Document Overview",
                mindMap: [
                    {
                        index: 1,
                        point: "Overview of PDF Content",
                        subPoints: [
                            { index: 2, point: "Unable to generate detailed mind map at this moment." }
                        ]
                    }
                ]
            };
        };

        const { generateResilient } = await import("@/utils/structured-generation");
        const { data } = await generateResilient({
            model: openrouter("google/gemini-2.5-flash:free"),
            prompt: pdfFile,
            schema: mindMapSchema,
            normalize: normalizeMindMap,
            fallback: fallbackMindMap,
            system: `You need to generate a mind map on the basis of the given content. The mind map is a tree-like structure where you will 
            start with one major point or subject discussed in the given content and then you will have sub-points branching out from the 
            main point and then further sub-points branching out from the sub-points and so on. The sub-points should be relevant to the 
            topic they are branching out from. The sub-points should be in the format of an array of objects where each object has an 
            index. Each index should be continuously increasing starting from 1. The mind map should cover the entire content of 
            the pdf. Each point should be a short snippet of words, not very long ones, and in the range of 5-10 words maximum.
            
            Format:
            {
              "topic": "Main Topic String",
              "mindMap": [
                {
                  "index": 1,
                  "point": "Main Point",
                  "subPoints": [
                    { "index": 2, "point": "Sub Point" }
                  ]
                }
              ]
            }`
        });

        let finalMindMap = data.mindMap;

        if (Array.isArray(finalMindMap) && finalMindMap.length > 1) {
            finalMindMap = [
                {
                    index: 0,
                    point: data.topic || "Main Topic",
                    subPoints: finalMindMap
                }
            ];
        } else if (!Array.isArray(finalMindMap) && finalMindMap !== null && typeof finalMindMap === 'object') {
            finalMindMap = [finalMindMap];
        } else if (!Array.isArray(finalMindMap)) {
            finalMindMap = [
                {
                    index: 0,
                    point: data.topic || "Main Topic",
                    subPoints: []
                }
            ];
        }

        return Response.json({
            success: true,
            message: "mind map generated",
            result: finalMindMap,
            topic: data.topic
        });
    } catch (error) {
        console.error("error : ", error);
        return Response.json({
            error: "something went wrong while generating mind map"
        }, { status: 500 });
    }
}