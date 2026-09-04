export const MAX_INPUT_LENGTH = 10_000;

export type NormalizeInputError = "empty" | "too_long" | "prompt_injection";

export interface NormalizeInputSuccess {
  ok: true;
  text: string;
}

export interface NormalizeInputFailure {
  ok: false;
  error: NormalizeInputError;
  message: string;
}

export type NormalizeInputResult = NormalizeInputSuccess | NormalizeInputFailure;

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|preceding)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|preceding)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions?|prompts?|rules?)/i,
  /do\s+not\s+follow\s+(your|the|any)\s+(previous\s+)?(instructions?|rules?|guidelines?)/i,
  /you\s+are\s+now\s+(a|an|my)\b/i,
  /\bnew\s+instructions?\s*:/i,
  /\bsystem\s+prompt\s*:/i,
  /override\s+(the\s+)?(system|safety|previous)\b/i,
  /\bjailbreak\b/i,
  /<\|?(im_start|im_end|system|user|assistant)\|?>/i,
  /\[INST\]/i,
  /<<\s*SYS\s*>>/i,
  /###\s*system\b/i,
];

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function containsPromptInjection(value: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function normalizeInput(raw: string): NormalizeInputResult {
  const text = normalizeLineEndings(raw).trim();

  if (text.length === 0) {
    return { ok: false, error: "empty", message: "Text cannot be empty." };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      error: "too_long",
      message: `Text exceeds the ${MAX_INPUT_LENGTH} character limit.`,
    };
  }

  if (containsPromptInjection(text)) {
    return {
      ok: false,
      error: "prompt_injection",
      message: "Text looks like a prompt injection attempt and was rejected.",
    };
  }

  return { ok: true, text };
}
