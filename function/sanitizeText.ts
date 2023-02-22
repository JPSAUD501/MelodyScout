import sanitizeHtml from 'sanitize-html'

export function sanitizeText (text: string): string {
  let sanitizedText = text
  sanitizedText = sanitizeHtml(sanitizedText)
  return sanitizedText
}
