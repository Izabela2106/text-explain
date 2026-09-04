"use server";

import { analyzeText, type AnalyzeTextResult } from "./analyze-text";

export async function analyzeTextAction(raw: string): Promise<AnalyzeTextResult> {
  const result = await analyzeText(raw);
  console.log("[analyzeTextAction] result:", JSON.stringify(result, null, 2));
  return result;
}
