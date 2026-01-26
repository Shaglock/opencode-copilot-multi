/**
 * JSONC (JSON with Comments) utilities
 * 
 * Simple parser that strips comments and trailing commas
 * to enable JSON.parse() on JSONC files
 */

/**
 * Parse JSONC content to JavaScript object
 * Removes:
 * - Single-line comments (// ...)
 * - Multi-line comments (slash-star ... star-slash)
 * - Trailing commas
 */
export function parseJSONC(content: string): any {
  // Strategy: Remove comments carefully, preserving strings
  
  let cleaned = '';
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    // Handle escape sequences in strings
    if (escapeNext) {
      if (inString) {
        cleaned += char;
      }
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      cleaned += char;
      escapeNext = true;
      continue;
    }
    
    // Toggle string mode
    if (char === '"' && !inSingleLineComment && !inMultiLineComment) {
      inString = !inString;
      cleaned += char;
      continue;
    }
    
    // Inside string - preserve everything
    if (inString) {
      cleaned += char;
      continue;
    }
    
    // Start single-line comment
    if (char === '/' && nextChar === '/' && !inMultiLineComment) {
      inSingleLineComment = true;
      i++; // Skip next char
      continue;
    }
    
    // End single-line comment
    if (inSingleLineComment && (char === '\n' || char === '\r')) {
      inSingleLineComment = false;
      cleaned += char; // Preserve newline
      continue;
    }
    
    // Start multi-line comment
    if (char === '/' && nextChar === '*' && !inSingleLineComment) {
      inMultiLineComment = true;
      i++; // Skip next char
      continue;
    }
    
    // End multi-line comment
    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i++; // Skip next char
      continue;
    }
    
    // Skip comment content
    if (inSingleLineComment || inMultiLineComment) {
      continue;
    }
    
    // Preserve non-comment content
    cleaned += char;
  }
  
  // Remove trailing commas (before } or ])
  const trailingCommaPattern = /,(\s*[}\]])/g;
  cleaned = cleaned.replace(trailingCommaPattern, '$1');
  
  return JSON.parse(cleaned);
}

/**
 * Stringify object to JSON with formatting
 * Note: This does NOT preserve original comments
 */
export function stringifyJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}
