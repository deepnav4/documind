import { generateObject, generateText, type LanguageModel } from "ai";
import type { z } from "zod";

const LAYER_TIMEOUT_MS = 25_000;

// A timeout signal that works regardless of runtime AbortSignal.timeout support.
function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * Pull the first JSON object/array out of arbitrary model text (handles code
 * fences, leading prose, and common trailing-comma breakage). Returns the
 * parsed value, or null if nothing parseable is found.
 */
export function extractJson(text: string): unknown | null {
  if (!text) return null;
  let s = text.trim();

  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) return null;

  const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (end === -1 || end < start) return null;

  let candidate = s.slice(start, end + 1);

  const tryParse = (str: string): unknown | undefined => {
    try {
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  };

  let parsed = tryParse(candidate);
  if (parsed !== undefined) return parsed;

  // Light repair: strip trailing commas before } or ].
  candidate = candidate.replace(/,\s*([}\]])/g, "$1");
  parsed = tryParse(candidate);
  if (parsed !== undefined) return parsed;

  return null;
}

/**
 * Normalize any "page source" shape the model emits ([1], ["1"],
 * [{ page_number: 1 }]) into a clean number[].
 */
export function coercePageSource(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const v of value) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out.push(v);
    } else if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
      out.push(Number(v));
    } else if (v && typeof v === "object" && "page_number" in v) {
      const n = Number((v as { page_number: unknown }).page_number);
      if (Number.isFinite(n)) out.push(n);
    }
  }
  return out;
}

type ResilientArgs<T> = {
  model: LanguageModel;
  system: string;
  prompt: string;
  /** The predefined contract. Final output is guaranteed to satisfy this. */
  schema: z.ZodType<T>;
  /** Coerce arbitrary parsed JSON into the schema shape (or null if hopeless). */
  normalize: (raw: unknown) => T | null;
  /** Deterministic, model-free generator used as the last resort. */
  fallback?: () => T;
  timeoutMs?: number;
};

export type ResilientResult<T> = {
  data: T;
  source: "model" | "repaired" | "fallback";
};

/**
 * Generate structured data that ALWAYS satisfies `schema`, degrading gracefully
 * across three layers so an unreliable model can never produce an invalid
 * response, hang, or hard-fail the route.
 */
export async function generateResilient<T>(
  args: ResilientArgs<T>
): Promise<ResilientResult<T>> {
  const {
    model,
    system,
    prompt,
    schema,
    normalize,
    fallback,
    timeoutMs = LAYER_TIMEOUT_MS,
  } = args;

  // Layer 1 — strict structured generation (best quality).
  try {
    const { object } = await generateObject({
      model,
      system,
      prompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: schema as any,
      maxRetries: 1,
      abortSignal: timeoutSignal(timeoutMs),
    });
    return { data: object as T, source: "model" };
  } catch {
    // fall through
  }

  // Layer 2 — free-form text, extract JSON ourselves, normalize, then validate.
  try {
    const { text } = await generateText({
      model,
      system: `${system}\n\nReturn ONLY the raw JSON. No explanation, no markdown code fences.`,
      prompt,
      maxRetries: 1,
      abortSignal: timeoutSignal(timeoutMs),
    });
    const raw = extractJson(text);
    if (raw != null) {
      const normalized = normalize(raw);
      if (normalized != null) {
        const checked = schema.safeParse(normalized);
        if (checked.success) return { data: checked.data, source: "repaired" };
      }
    }
  } catch {
    // fall through
  }

  // Layer 3 — deterministic, model-free.
  if (fallback) {
    const fb = fallback();
    const checked = schema.safeParse(fb);
    return { data: checked.success ? checked.data : fb, source: "fallback" };
  }

  throw new Error("All structured generation layers failed.");
}
