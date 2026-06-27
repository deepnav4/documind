import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from "ai"

export async function POST(req: Request) {
    try {
        const {prompt} = await req.json()
    const {text} = await generateText({
        model:  openrouter('openai/gpt-oss-120b:free'),
        prompt: prompt,
        system: "You are a assisant whose task is to format a given sentence, that sentence is what has been said by the user and is to be given to a AI model to generate a response. So just format the sentence and return it. Don't add any extra information. And also strictly do not eliminate anything from the sentence or change the meaning of the sentence."
    })

    return Response.json({text})
    } catch (error) {
        console.log("Can't Transcribe",error)
    }
}