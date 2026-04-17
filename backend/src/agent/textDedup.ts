const MARKDOWN_BLOCK_START_PATTERNS = [
  /^#{1,6}\s/, // headings
  /^[-*+]\s/, // unordered list
  /^\d+\.\s/, // ordered list
  /^\|/, // table row
  /^```/, // code block
  /^>\s/, // blockquote
];

function startsWithMarkdownBlock(text: string): boolean {
  const trimmedStart = text.trimStart();
  return MARKDOWN_BLOCK_START_PATTERNS.some((pattern) =>
    pattern.test(trimmedStart),
  );
}

export function getUniqueTextChunk(
  emittedText: string,
  incomingText: string,
): string {
  if (!incomingText) {
    return "";
  }

  if (!emittedText) {
    return incomingText;
  }

  if (emittedText.includes(incomingText)) {
    return "";
  }

  if (incomingText.startsWith(emittedText)) {
    return incomingText.slice(emittedText.length);
  }

  if (emittedText.endsWith(incomingText)) {
    return "";
  }

  const maxOverlap = Math.min(emittedText.length, incomingText.length);
  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    if (emittedText.endsWith(incomingText.slice(0, overlap))) {
      return incomingText.slice(overlap);
    }
  }

  return incomingText;
}

export function normalizeTextChunkBoundary(
  emittedText: string,
  uniqueChunk: string,
): string {
  if (!uniqueChunk || !emittedText) {
    return uniqueChunk;
  }

  if (/\s$/.test(emittedText)) {
    return uniqueChunk;
  }

  if (/^\s/.test(uniqueChunk)) {
    return uniqueChunk;
  }

  if (!startsWithMarkdownBlock(uniqueChunk)) {
    return uniqueChunk;
  }

  return `\n\n${uniqueChunk}`;
}
