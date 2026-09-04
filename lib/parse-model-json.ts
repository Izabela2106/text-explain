/**
 * Parse JSON from an LLM that often returns fences, extra prose,
 * trailing commas, or unescaped quotes inside string values.
 */
export function parseModelJson(content: string): unknown {
  const stripped = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const extracted = extractJsonValue(stripped);
  const repaired = repairJson(extracted);
  const closed = closeTruncatedJson(repaired);
  const candidates = uniqueStrings([extracted, repaired, closed, closeTruncatedJson(extracted)]);

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new SyntaxError("Model returned invalid JSON");
}

function extractJsonValue(text: string): string {
  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    return text.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return `{"terms":${text.slice(arrayStart, arrayEnd + 1)}}`;
  }

  return text;
}

function repairJson(text: string): string {
  const normalized = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/}\s*{/g, "},{")
    .replace(/]\s*\[/g, "],[");

  return escapeBrokenStringContents(normalized);
}

function escapeBrokenStringContents(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      if (isLikelyStringEnd(json, i)) {
        inString = false;
        out += ch;
      } else {
        out += '\\"';
      }
      continue;
    }

    if (ch === "\n") {
      out += "\\n";
      continue;
    }
    if (ch === "\r") {
      out += "\\r";
      continue;
    }
    if (ch === "\t") {
      out += "\\t";
      continue;
    }

    out += ch;
  }

  return out;
}

function isLikelyStringEnd(json: string, quoteIndex: number): boolean {
  const rest = json.slice(quoteIndex + 1);
  return /^\s*(:|(,\s*")|(,?\s*[}\]])|$)/.test(rest);
}

/** Close unclosed strings, arrays, and objects in truncated model output. */
function closeTruncatedJson(text: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  const closers: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      out += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }

    if (ch === "{") {
      closers.push("}");
      out += ch;
      continue;
    }
    if (ch === "[") {
      closers.push("]");
      out += ch;
      continue;
    }
    if (ch === "}" || ch === "]") {
      if (closers.length > 0) closers.pop();
      out += ch;
      continue;
    }

    out += ch;
  }

  if (inString) {
    out += '"';
  }

  while (closers.length > 0) {
    out += closers.pop();
  }

  return out;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}
