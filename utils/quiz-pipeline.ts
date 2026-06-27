import { coercePageSource } from "@/utils/structured-generation";

export type QuizQuestion = {
  index: number;
  question: string;
  options: { optionIndex: number; option: string }[];
  correctOption: number;
  explanation: string;
  source?: number[];
};

type AnyChunk = { text?: string; meta?: any; metadata?: any };

const chunkPages = (c: AnyChunk): number[] =>
  (c?.meta?.page_numbers ?? c?.metadata?.page_numbers ?? []) as number[];

// Drop chunks that can't yield good questions (TOC, references, contact lines,
// number/symbol-heavy tables, tiny fragments).
function isQuizWorthy(c: AnyChunk): boolean {
  const t = (c?.text ?? "").trim();
  if (t.length < 80) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters / t.length < 0.5) return false; // mostly numbers/symbols
  if (
    t.length < 300 &&
    /\b(references|bibliography|contents|index|fax|tel|e-?mail|copyright|all rights reserved)\b/i.test(t)
  ) {
    return false;
  }
  return true;
}

// Page numbers already used by existing quiz sets — drives cross-quiz coverage.
export function coveredPagesFromQuizzes(existingSets: Array<{ data?: unknown }>): number[] {
  const pages = new Set<number>();
  for (const set of existingSets || []) {
    const questions = Array.isArray(set?.data) ? (set.data as Array<{ source?: unknown }>) : [];
    for (const q of questions) {
      for (const p of coercePageSource(q?.source)) pages.add(p);
    }
  }
  return Array.from(pages);
}

// Stratified selection across the WHOLE document (uncovered pages first), so a
// quiz spans the entire document and repeated quizzes drill into new material.
export function selectQuizChunks(
  chunks: AnyChunk[],
  coveredPages: number[],
  regions: number
): AnyChunk[] {
  const worthy = chunks.filter(isQuizWorthy);
  if (worthy.length === 0) return [];

  const covered = new Set(coveredPages);
  const uncovered = worthy.filter((c) => {
    const pages = chunkPages(c);
    return pages.length === 0 || pages.some((p) => !covered.has(p));
  });

  // Prefer not-yet-quizzed material; fall back to the full set once exhausted.
  const pool = uncovered.length >= Math.min(regions, worthy.length) ? uncovered : worthy;

  const target = Math.min(regions, pool.length);
  const selected: AnyChunk[] = [];
  const seen = new Set<number>();
  const step = pool.length / target;
  for (let i = 0; i < target; i++) {
    const idx = Math.min(pool.length - 1, Math.floor(i * step + step / 2));
    if (!seen.has(idx)) {
      seen.add(idx);
      selected.push(pool[idx]);
    }
  }
  return selected;
}

function isGoodQuestion(q: QuizQuestion): boolean {
  if (!q?.question || q.question.trim().length < 12) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  for (const o of q.options) {
    const opt = (o?.option ?? "").trim();
    if (!opt) return false;
    const letters = (opt.match(/[A-Za-z]/g) || []).length;
    // reject options that are mostly digits/symbols (phone/fax/page artefacts)
    if (opt.length > 3 && letters / opt.length < 0.4) return false;
  }
  const distinct = new Set(q.options.map((o) => (o.option || "").trim().toLowerCase()));
  if (distinct.size < 4) return false;
  if (!Number.isFinite(q.correctOption) || q.correctOption < 1 || q.correctOption > 4) return false;
  return true;
}

function questionKey(q: QuizQuestion): string {
  return (q.question || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
}

// Dedupe + quality-gate + take up to `count`, never padding.
export function finalizeQuiz(pool: QuizQuestion[], count: number): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const q of pool) {
    if (!isGoodQuestion(q)) continue;
    const key = questionKey(q);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(q);
    if (out.length >= count) break;
  }
  return out.map((q, i) => ({ ...q, index: i + 1 }));
}

/**
 * Generate a document-wide, quality-first quiz set:
 * - select stratified chunks across (uncovered-first) the whole document
 * - ask the model per chunk for up to a couple of GOOD questions (or none)
 * - stamp each question with that chunk's real page numbers
 * - dedupe + quality-gate + take up to `count`
 *
 * Work is bounded by `count` (not document size), so it scales from 9 to 500+
 * pages, and returns fewer questions rather than fabricating weak ones.
 */
export async function generateQuizSet(opts: {
  chunks: AnyChunk[];
  coveredPages: number[];
  count: number;
  endpoint?: string;
  signal?: AbortSignal;
}): Promise<QuizQuestion[]> {
  const { chunks, coveredPages, count, endpoint = "/api/generate-quiz", signal } = opts;

  const selected = selectQuizChunks(chunks, coveredPages, count + 2);
  if (selected.length === 0) return [];

  const pool: QuizQuestion[] = [];
  for (const chunk of selected) {
    if (signal?.aborted) throw new Error("AbortError");
    const pages = chunkPages(chunk);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ text: chunk.text, maxCount: 2 }),
        signal,
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.result)) {
        for (const q of data.result as QuizQuestion[]) {
          pool.push({ ...q, source: pages });
        }
      }
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.message === "AbortError") throw error;
      // Skip this chunk on a transient error and keep covering the document.
    }
  }

  return finalizeQuiz(pool, count);
}
