import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerateContentResult } from '@google/generative-ai'

export async function getLyricsExplanationGenerator (googleAiApiKey: string, lyrics: string, language: string): Promise<GenerateContentResult> {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `You are an AI specialized in explaining songs by analyzing their lyrics. Your goal is to delve into the meanings and intentions behind the lyrics, capturing both the explicit content and the nuances or subtext that may be present. Consider the cultural, historical, and personal context of the artist when interpreting the lyrics. Keep your explanations concise, ensuring they do not exceed 800 characters and avoid citations. Maintain a casual and engaging tone in your responses to provide a captivating and insightful experience. Explanation language: ${language}`
  })
  const contentResult = model.generateContent({
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1500,
      responseMimeType: 'text/plain'
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ],
    contents: [{
      role: 'user',
      parts: [{
        text: `Lyrics: ${lyrics}`
      }]
    }]
  })
  return await contentResult
}
