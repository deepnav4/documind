import { openrouter } from "@openrouter/ai-sdk-provider";
import type { z } from "zod";
import { flashCardStackSchema } from "./schema";
import { coercePageSource, generateResilient } from "@/utils/structured-generation";

type FlashCardStack = z.infer<typeof flashCardStackSchema>;
type FlashCard = FlashCardStack["flashCards"][number];

// Coerce arbitrary model JSON ({ flashCards: [...] } or a bare array, possibly
// with odd field shapes) into the predefined schema, dropping unusable items.
function normalizeFlashCards(raw: unknown): FlashCardStack | null {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { flashCards?: unknown }).flashCards)
      ? (raw as { flashCards: unknown[] }).flashCards
      : null;
  if (!arr) return null;

  const flashCards: FlashCard[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const question = typeof obj.question === "string" ? obj.question.trim() : "";
    const answer = typeof obj.answer === "string" ? obj.answer.trim() : "";
    if (!question || !answer) continue;
    flashCards.push({
      index: flashCards.length + 1,
      question,
      answer,
      source: coercePageSource(obj.source),
    });
  }
  return flashCards.length > 0 ? { flashCards } : null;
}

// Deterministic, model-free fallback: build fill-in-the-blank cards from the
// document text so the endpoint always returns valid cards.
function cleanText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateSentences(text: string): string[] {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 300);
}

function createFallbackFlashCards(text: string, count: number): FlashCardStack {
  const sentences = candidateSentences(text);
  const flashCards: FlashCard[] = [];

  for (const sentence of sentences) {
    if (flashCards.length >= count) break;
    let key = "";
    for (const word of sentence.split(/\s+/)) {
      const cleaned = word.replace(/[^A-Za-z]/g, "");
      if (cleaned.length > key.length) key = cleaned;
    }
    if (key.length < 4) continue;
    const blanked = sentence.replace(new RegExp(`\\b${key}\\b`), "_____");
    flashCards.push({
      index: flashCards.length + 1,
      question: `Fill in the blank: ${blanked}`,
      answer: key,
      source: [],
    });
  }

  return { flashCards };
}

export const POST = async (req: Request) => {
  let text = "";
  let targetCount = 5;

  try {
    const body = await req.json();
    text = typeof body.text === "string" ? body.text : "";
    targetCount = Math.min(50, Math.max(1, Number(body.targetCount) || 5));

    const { data } = await generateResilient<FlashCardStack>({
      model: openrouter("openai/gpt-oss-120b:free"),
      prompt: text,
      schema: flashCardStackSchema,
      normalize: normalizeFlashCards,
      fallback: () => createFallbackFlashCards(text, targetCount),
      system: `Given the text content you need to generate flash cards.
            Return a JSON object containing a 'flashCards' array with EXACTLY
            ${targetCount} objects where each has an index.
            Each index should be continuously increasing starting from 1
            (this will help in identifying the order of the flash cards).
            One question and answer in each object on the basis of the content
            provided by the user.
            Consider creating flash cards from multiple chunks, not all flash cards from one chunk only.`,
    });

    if (!data.flashCards || data.flashCards.length === 0) {
      return Response.json(
        { success: false, error: "Could not generate flash cards from the provided text." },
        { status: 422 }
      );
    }

    return Response.json({
      success: true,
      message: "summary generated successfully",
      result: data.flashCards,
    });
  } catch (error) {
    console.error("error in generating flash cards: ", error);

    // Last-resort deterministic fallback so the client never gets a hard failure.
    const fallback = createFallbackFlashCards(text, targetCount);
    if (fallback.flashCards.length > 0) {
      return Response.json({
        success: true,
        message: "flash cards generated using fallback generation",
        result: fallback.flashCards,
      });
    }

    return Response.json(
      { error: "Something went wrong while generating flash cards" },
      { status: 500 }
    );
  }
};
