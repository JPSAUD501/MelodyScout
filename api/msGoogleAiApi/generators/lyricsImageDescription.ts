import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerateContentResult } from '@google/generative-ai'

export async function getLyricsImageDescriptionGenerator (googleAiApiKey: string, lyrics: string): Promise<GenerateContentResult> {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: 'You are an AI specialized in generating image prompts based on song lyrics for use with the StableDiffusion API. Your goal is to create a vivid and engaging image description that captures the essence and key themes of the song. Ensure the description is concise, detailed, and does not exceed 300 characters. Focus on imagery, emotions, and stylistic elements that represent the song.\n\nGuidelines:\n\nKey Elements: Identify the main themes, emotions, and imagery in the song lyrics.\nImagery Description: Craft a detailed yet concise description that visually represents these key elements.\nCharacter Limit: Ensure the entire description does not exceed 300 characters.\nCreative Style: Use a creative and evocative tone to make the description engaging and vivid.\nExample Response:\n\nFor the song "Imagine" by John Lennon:\n"A serene world with no borders, people of different cultures holding hands, sky full of doves, peaceful landscape, utopian city in the background, vibrant colors, soft light, realistic and whimsical style."\n\nFor the song "Dollhouse" by Melanie Martinez:\n"A perfect dollhouse facade with dark secrets inside, family members with forced smiles, mother with wine, father with hidden lover, brother smoking, sad child peeking through curtains, eerie and colorful cartoon style."'
  })
  const contentResult = model.generateContent({
    generationConfig: {
      temperature: 0.9,
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
