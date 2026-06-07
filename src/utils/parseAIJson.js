export function parseAIJson(text, fallback) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return fallback
  }
}
