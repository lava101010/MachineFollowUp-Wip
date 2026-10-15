/**
 * Energya Cables - Data Cleaning & Normalization Engine
 */

/**
 * Standardize reel or job card values, converting missing/null/empty/0 to 'without'
 */
export function cleanReelOrCard(val) {
  if (val === null || val === undefined) return "without";
  const s = String(val).trim();
  const lower = s.toLowerCase();
  if (!s || s === "0" || lower === "without" || s === "-" || lower === "null" || lower === "none" || lower === "nan" || lower === "undefined") {
    return "without";
  }
  return s;
}

/**
 * Normalize alphanumeric codes for comparison (e.g. 'G-90' and 'G90' -> 'G90')
 */
export function normalizeCode(val) {
  if (val === null || val === undefined) return "without";
  const cleaned = cleanReelOrCard(val);
  if (cleaned === "without") return "without";
  // Strip hyphens, underscores, slashes, spaces, dots, and convert to uppercase
  return cleaned.toUpperCase().replace(/[\s\-_/.]/g, '').trim();
}

/**
 * Standardize cable wire size notation:
 * - Eliminates mm2, mm², mm, MM
 * - Converts uppercase 'X' or '*' to lowercase 'x'
 * - Removes extra spaces around operators (3x300+150)
 * - Combines coreCount if plain number is provided (4 + 25 -> 4x25)
 */
export function formatWireSize(wireSize, coreCount) {
  if (wireSize === null || wireSize === undefined) return '';
  let s = String(wireSize).trim();
  if (!s) return '';

  // 1. Remove mm2, mm², MM2, MM, mm
  s = s.replace(/mm[²2]?/gi, '').trim();

  // 2. Replace any asterisk (*) or uppercase X with lowercase x
  s = s.replace(/[*X]/g, 'x');

  // 3. Remove spaces around x, +, and / (e.g. "3 x 400" -> "3x400", "240 + 120" -> "240+120")
  s = s.replace(/\s*([x+/])\s*/g, '$1').trim();

  // 4. If it already contains an operator (x, +, /), return it directly
  const hasOperator = s.includes('x') || s.includes('+') || s.includes('/');
  if (hasOperator) {
    return s;
  }

  // 5. If it's a plain number (e.g. "25"), combine with coreCount if valid
  const cores = parseInt(coreCount);
  if (cores && cores > 0) {
    return `${cores}x${s}`;
  }
  return s;
}

/**
 * Normalize Arabic text for forgiving search (ignores variations in hamzas, taa marbuta, etc.)
 */
export function normalizeArabicText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}
