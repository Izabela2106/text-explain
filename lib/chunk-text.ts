export const DEFAULT_MAX_CHUNK_LENGTH = 5_000;
export const DEFAULT_CHUNK_CONTEXT_LENGTH = 240;

export interface ChunkTextOptions {
  maxChunkLength?: number;
  contextLength?: number;
}

function assertOptions(
  maxChunkLength: number,
  contextLength: number,
): void {
  if (!Number.isInteger(maxChunkLength) || maxChunkLength < 1) {
    throw new RangeError("maxChunkLength must be a positive integer.");
  }

  if (
    !Number.isInteger(contextLength) ||
    contextLength < 0 ||
    contextLength >= maxChunkLength
  ) {
    throw new RangeError(
      "contextLength must be a non-negative integer smaller than maxChunkLength.",
    );
  }
}

function findChunkEnd(
  text: string,
  start: number,
  maxChunkLength: number,
): number {
  const hardEnd = Math.min(start + maxChunkLength, text.length);

  if (hardEnd === text.length) {
    return hardEnd;
  }

  const minimumUsefulEnd = start + Math.floor(maxChunkLength * 0.6);
  const window = text.slice(start, hardEnd);

  const paragraphBreak = window.lastIndexOf("\n\n");
  if (paragraphBreak >= minimumUsefulEnd - start) {
    return start + paragraphBreak;
  }

  let sentenceEnd = -1;
  const sentenceBoundary = /[.!?]["')\]]*(?=\s)/g;
  for (const match of window.matchAll(sentenceBoundary)) {
    const candidate = (match.index ?? 0) + match[0].length;
    if (candidate >= minimumUsefulEnd - start) {
      sentenceEnd = candidate;
    }
  }

  if (sentenceEnd !== -1) {
    return start + sentenceEnd;
  }

  const whitespaceBreak = Math.max(
    window.lastIndexOf(" "),
    window.lastIndexOf("\n"),
    window.lastIndexOf("\t"),
  );

  return whitespaceBreak >= minimumUsefulEnd - start
    ? start + whitespaceBreak
    : hardEnd;
}

function findContextStart(
  text: string,
  chunkStart: number,
  chunkEnd: number,
  contextLength: number,
): number {
  if (contextLength === 0) {
    return chunkEnd;
  }

  const desiredStart = Math.max(chunkStart + 1, chunkEnd - contextLength);
  const contextWindow = text.slice(desiredStart, chunkEnd);

  const paragraphBreak = contextWindow.indexOf("\n\n");
  if (paragraphBreak !== -1) {
    return desiredStart + paragraphBreak + 2;
  }

  const sentenceBoundary = /[.!?]["')\]]*\s+/g;
  const sentenceMatch = sentenceBoundary.exec(contextWindow);
  if (sentenceMatch) {
    return desiredStart + sentenceMatch.index + sentenceMatch[0].length;
  }

  const whitespaceMatch = /\s+/.exec(contextWindow);
  return whitespaceMatch
    ? desiredStart + whitespaceMatch.index + whitespaceMatch[0].length
    : desiredStart;
}

/**
 * Splits normalized input at paragraph or sentence boundaries when possible.
 * Consecutive chunks overlap slightly so the model can judge boundary terms
 * with nearby context.
 */
export function chunkText(
  text: string,
  options: ChunkTextOptions = {},
): string[] {
  const maxChunkLength =
    options.maxChunkLength ?? DEFAULT_MAX_CHUNK_LENGTH;
  const contextLength =
    options.contextLength ??
    Math.min(DEFAULT_CHUNK_CONTEXT_LENGTH, maxChunkLength - 1);

  assertOptions(maxChunkLength, contextLength);

  if (text.length <= maxChunkLength) {
    return text.length === 0 ? [] : [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = findChunkEnd(text, start, maxChunkLength);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end === text.length) {
      break;
    }

    start = findContextStart(text, start, end, contextLength);
    while (start < text.length && /\s/.test(text[start])) {
      start += 1;
    }
  }

  return chunks;
}
