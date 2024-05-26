import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerateContentResult } from '@google/generative-ai'

export async function getLyricsEmojisGenerator (googleAiApiKey: string, lyrics: string): Promise<GenerateContentResult> {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: 'You are an AI specialized in generating emoji sequences based on song lyrics. Your goal is to capture the essence and key themes of the song using no more than 30 emojis. Consider the emotions, imagery, and major elements described in the lyrics. Maintain a fun and creative approach to make the emoji representation engaging and relatable.\n\nGuidelines:\nKey Elements: Identify the main themes, emotions, and imagery in the song lyrics.\nEmoji Representation: Select emojis that best represent these key elements.\nCharacter Limit: Ensure the entire emoji sequence does not exceed 30 emojis.'
  })
  const contentResult = model.generateContent({
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 200,
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
