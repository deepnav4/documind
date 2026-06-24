import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { mindMapSchema, mindMapSummarySchema } from "./schema";

export const POST= async(req: Request) => {
    try {
        const {pdfFile, phase} = await req.json();

        if (phase === "map") {
            const { generateText } = await import("ai");
            const result = await generateText({
                model: openrouter("openai/gpt-oss-120b:free"),
                prompt: pdfFile,
                system: "Extract a structural outline and key concepts from the provided text snippet. Do not skip important keywords, headings, or metadata. Provide a concise, hierarchical text outline that captures the essence of the concepts discussed. Keep it as brief as possible while retaining full structural accuracy."
            });

            return Response.json({
                success: true,
                message: "mind map summary generated",
                summary: result.text
            });
        }

        const { generateText } = await import("ai");
        const result = await generateText({
            model: openrouter("openai/gpt-oss-120b:free"),
            prompt: pdfFile,
            system: `You need to generate a mind map on the basis of the given content, the mind map is a tree like structure where you will 
            start with one major point or subject discussed in the given content and then you will have sub-points branching out from the 
            main point and then further sub-points branching out from the sub-points and so on, the sub-points should be relevant to the 
            topic they are branching out from, the sub-points should be in the format of an array of objects where each object has an 
            index each index should be continuously increasing strarting from 1 (continuing to 2,3,4,5 so on depending on the number of 
            objects thereby, this will help in identifying the order of the mind map). The mind map should cover the entire content of 
            the pdf. Each points should be short snippet of words and not very long ones, each point should be in the range of 5-10 words 
            maximum. Note that at first there will be strictlyonly one point in the array and then it will branch out to few (say 3-4 subpoints of 
            that and then each subpoint will further have some subpoint and so on), the layer need not go more than 7-8 nesting levels, 
            but should go upto 3-5 nesting levels depending on what is required in case. Note the first step should have strictly one 
            point only in the array and it should be the main topic of the pdf and further we can have as many subpoints as required.
            Note that the first step should not have more than 5-6 subpoints.
            
            CRITICAL: You MUST output ONLY valid JSON matching this exact structure:
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
            }
            Do NOT output any conversational text. ONLY output the raw JSON object.`
        });

        let jsonStr = result.text;
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
            jsonStr = match[1];
        }
        
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
        
        const parsedData = JSON.parse(jsonStr);

        let finalMindMap = parsedData.mindMap;

        if (Array.isArray(finalMindMap) && finalMindMap.length > 1) {
            finalMindMap = [
                {
                    index: 0,
                    point: parsedData.topic || "Main Topic",
                    subPoints: finalMindMap
                }
            ];
        } else if (!Array.isArray(finalMindMap) && finalMindMap !== null && typeof finalMindMap === 'object') {
            finalMindMap = [finalMindMap];
        } else if (!Array.isArray(finalMindMap)) {
            finalMindMap = [
                 {
                    index: 0,
                    point: parsedData.topic || "Main Topic",
                    subPoints: []
                 }
            ]
        }

        return Response.json({
            success: true,
            message: "mind map generated",
            result: finalMindMap,
            topic: parsedData.topic
        });
    } catch (error) {
        console.error("error : ", error)
        return Response.json({
            error: "something went wrong while generating mind map"
        }, {status: 500})
    }
}