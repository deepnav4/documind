import { openrouter } from "@openrouter/ai-sdk-provider";
import { quizSchema, type QuizSchema } from "./schema";
import { coercePageSource, generateResilient } from "@/utils/structured-generation";

type QuizQuestion = QuizSchema["quiz"][number];

// Coerce arbitrary model JSON into the predefined quiz schema, keeping only
// questions that can form a valid 4-option MCQ.
function normalizeQuiz(raw: unknown): QuizSchema | null {
    const arr = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object" && Array.isArray((raw as { quiz?: unknown }).quiz)
          ? (raw as { quiz: unknown[] }).quiz
          : null;
    if (!arr) return null;

    const quiz: QuizQuestion[] = [];
    for (const item of arr) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;

        const question = typeof obj.question === "string" ? obj.question.trim() : "";
        if (!question) continue;

        const rawOptions = Array.isArray(obj.options) ? obj.options : [];
        const optionTexts: string[] = [];
        for (const o of rawOptions) {
            const optText =
                typeof o === "string"
                    ? o
                    : o && typeof o === "object" && typeof (o as { option?: unknown }).option === "string"
                      ? ((o as { option: string }).option)
                      : "";
            if (optText.trim()) optionTexts.push(optText.trim());
            if (optionTexts.length === 4) break;
        }
        if (optionTexts.length < 4) continue; // schema requires exactly 4

        const options = optionTexts.map((option, i) => ({ optionIndex: i + 1, option }));

        let correctOption = Number(obj.correctOption);
        if (!Number.isFinite(correctOption) || correctOption < 1 || correctOption > 4) {
            correctOption = 1;
        }

        const explanation =
            typeof obj.explanation === "string" && obj.explanation.trim()
                ? obj.explanation.trim()
                : "Based on the provided document content.";

        quiz.push({
            index: quiz.length + 1,
            question,
            options,
            correctOption,
            explanation,
            source: coercePageSource(obj.source),
        });
    }

    return quiz.length > 0 ? { quiz } : null;
}

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const text = typeof body.text === "string" ? body.text : "";
        const maxCount = Math.min(3, Math.max(1, Number(body.maxCount) || 2));

        if (!text.trim()) {
            return Response.json({ success: true, result: [] });
        }

        const { data } = await generateResilient<QuizSchema>({
            model: openrouter("openai/gpt-oss-120b:free"),
            prompt: text,
            schema: quizSchema,
            normalize: normalizeQuiz,
            // Quality-first: NEVER fabricate. If nothing good, return none.
            fallback: () => ({ quiz: [] }),
            system: `You write high-quality multiple-choice quiz questions from the provided document excerpt.

Return a JSON object with a "quiz" array containing UP TO ${maxCount} questions — but ONLY questions that test a genuinely important, factual concept clearly present in the excerpt.

Rules:
- Each question must have exactly 4 distinct, plausible options, with exactly one correct.
- correctOption is the optionIndex (1-4) of the correct option.
- Include a short explanation grounded in the excerpt.
- Do NOT invent facts. Never build questions from page numbers, headings, contact details (phone/fax/email), references, or table-of-contents text.
- If the excerpt has nothing genuinely quiz-worthy, return an empty "quiz" array. Returning fewer (or zero) good questions is strongly preferred over padding with weak ones.`,
        });

        return Response.json({
            success: true,
            message: "quiz candidates generated",
            result: Array.isArray(data?.quiz) ? data.quiz : [],
        });
    } catch (error) {
        console.error("error in generating quiz: ", error);
        // Quality-first: never fabricate — return empty and let the pipeline decide.
        return Response.json({ success: true, result: [] });
    }
};
