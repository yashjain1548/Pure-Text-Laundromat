
/**
 * Replaces single line breaks with a space, but preserves double line breaks (paragraphs).
 * Handles common PDF issues where sentences are broken mid-line.
 */
export const smartDeBreak = (text: string): string => {
  if (!text) return '';
  
  // 1. Replace hyphenated line breaks (e.g., "commu-\nnication") with just the joined word.
  //    Matches a word char, hyphen, optional whitespace, newline, optional whitespace, word char.
  let processed = text.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

  // 2. Replace single newlines that are NOT followed by another newline (lookahead)
  //    and NOT preceded by another newline (lookbehind simulated by previous step or checking context).
  //    Regex logic: Find a newline that is not surrounded by other newlines.
  processed = processed.replace(/([^\n])\n(?!\n)/g, '$1 ');

  return processed;
};

/**
 * Removes generic whitespace, converts tabs to spaces, trims ends.
 */
export const fixSpacing = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\t/g, ' ')       // Tabs to spaces
    .replace(/[ \v\f]+/g, ' ') // Multiple horizontal spaces to single
    .replace(/^ +/gm, '')      // Remove start-of-line spaces
    .replace(/ +$/gm, '')      // Remove end-of-line spaces
    .trim();
};

/**
 * Basic sentence casing.
 * Lowercases everything, then capitalizes the first letter of sentences.
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return '';
  const lower = text.toLowerCase();
  // Regex matches start of string OR punctuation followed by space(s)
  return lower.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
};

/**
 * Strips HTML tags (rudimentary) or Markdown-like artifacts if necessary.
 * For this app, we assume input is mostly plain text, but we clean up artifacts.
 */
export const stripFormatting = (text: string): string => {
  if (!text) return '';
  // 1. Remove HTML tags
  let processed = text.replace(/<\/?[^>]+(>|$)/g, "");
  // 2. Remove common markdown bold/italic markers
  processed = processed.replace(/(\*\*|__)(.*?)\1/g, "$2"); // Bold
  processed = processed.replace(/(\*|_)(.*?)\1/g, "$2");    // Italic
  return processed;
};

export const launderAll = (text: string): string => {
  let t = smartDeBreak(text);
  t = stripFormatting(t);
  t = fixSpacing(t);
  return t;
};

export interface TextStats {
  words: number;
  chars: number;
  paragraphs: number;
}

export const getStats = (text: string): TextStats => {
  if (!text) return { words: 0, chars: 0, paragraphs: 0 };
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, chars: text.length, paragraphs: 0 };

  return {
    chars: text.length,
    // Split by whitespace
    words: trimmed.split(/\s+/).length,
    // Split by double newline (paragraph logic)
    paragraphs: trimmed.split(/\n\s*\n/).length
  };
};
