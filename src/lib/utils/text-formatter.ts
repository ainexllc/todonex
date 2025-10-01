/**
 * Text formatting utilities for consistent display across the app
 */

/**
 * Convert text to Title Case (capitalize first letter of each word)
 * Exception: Preserve ALL CAPS if the entire string is uppercase
 *
 * @param text - The text to format
 * @returns Formatted text in Title Case (or original if ALL CAPS)
 */
export function toTitleCase(text: string): string {
  if (!text) return text

  // If the entire text is ALL CAPS, preserve it
  if (text === text.toUpperCase() && text !== text.toLowerCase()) {
    return text
  }

  // Convert to Title Case
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Convert text to ALL CAPS
 *
 * @param text - The text to format
 * @returns Text in ALL CAPS
 */
export function toAllCaps(text: string): string {
  return text.toUpperCase()
}
