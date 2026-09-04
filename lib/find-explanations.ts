import { parseModelJson } from "./parse-model-json";

const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 3;
const MAX_PARSE_ATTEMPTS = 2;

export interface ExplainTerm {
  term: string;
  explanation: string;
}

export interface ExplainResult {
  terms: ExplainTerm[];
}

const SYSTEM_PROMPT = `You are a reading assistant. The user will give you a text passage.

Your job:
1. Identify words or concepts that are worth explaining to a general reader.
2. Prefer multi-word concepts when that is the meaningful unit (e.g. "machine learning" over "machine").
3. Return a short, plain-language explanation for each term (one or two sentences).

Return ONLY a JSON object in this exact format: {"terms":[{"term":"...","explanation":"..."}]}
Do not include markdown fences or any text outside the JSON.
Do not use unescaped double quotes inside string values; use single quotes instead.`;

export async function findExplanations(chunk: string): Promise<ExplainResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set.");
  }

  const requestBody = JSON.stringify({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: chunk },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1024,
  });

  let lastParseError: unknown;

  for (let parseAttempt = 0; parseAttempt < MAX_PARSE_ATTEMPTS; parseAttempt++) {
    const content = await requestModelContent(apiKey, requestBody);
    console.log("[findExplanations] raw content:", content);

    if (!content) {
      console.warn("[findExplanations] empty content from model, retrying");
      continue;
    }

    try {
      return normalizeExplainResult(parseModelJson(content));
    } catch (error) {
      lastParseError = error;
      console.warn(
        "[findExplanations] invalid JSON from model, retrying",
        error,
      );
    }
  }

  console.warn(
    "[findExplanations] giving up after invalid JSON",
    lastParseError,
  );
  return { terms: [] };
}

async function requestModelContent(
  apiKey: string,
  requestBody: string,
): Promise<string> {
  let response: Response | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });

    if (response.status !== 429) break;
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }

  if (!response!.ok) {
    const body = await response!.text();
    throw new Error(`OpenRouter request failed (${response!.status}): ${body}`);
  }

  const data = await response!.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  return content?.trim() ?? "";
}

function normalizeExplainResult(parsed: unknown): ExplainResult {
  if (Array.isArray(parsed)) {
    return { terms: parsed };
  }

  if (parsed !== null && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;

    if (Array.isArray(record.terms)) {
      return { terms: record.terms as ExplainTerm[] };
    }

    if (
      typeof record.term === "string" &&
      typeof record.explanation === "string"
    ) {
      return {
        terms: [{ term: record.term, explanation: record.explanation }],
      };
    }
  }

  return { terms: [] };
}
