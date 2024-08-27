import OpenAI from 'openai'
import { advError } from '../../functions/advancedConsole'
import { lang } from '../../translations/base'

interface MsOpenAiApiError {
  success: false
  error: string
}

type MsOpenAiApiGetLyricsExplanationResponse = {
  success: true
  explanation: string
} | MsOpenAiApiError

type MsOpenAiApiGetLyricsImageDescriptionResponse = {
  success: true
  description: string
} | MsOpenAiApiError

export class MsOpenAiApi {
  private readonly openai: OpenAI

  constructor (openAiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAiApiKey
    })
  }

  async getLyricsExplanation (ctxLang: string | undefined, trackTittle: string, trackArtist: string, lyrics: string, lyricsRepresentation: string): Promise<MsOpenAiApiGetLyricsExplanationResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
`You are a creative and relaxed music critic. When you receive the lyrics of a song and an associated visual description, your task is to explain to the listener what the lyrics are conveying. Capture the nuances of the lyrics, both explicit and implicit, and integrate what makes this song unique. Relate your explanation to the provided image description without mentioning it.

Response Language: ${lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })}

Rules:
- Focus on the Lyrics: Analyze the song's lyrics to explore their meaning, emotions, and intentions.
- Capture the Nuances: Identify and explain subtle details, metaphors, and implied feelings in the lyrics.
- Integrate Visual Ideas: Relate your explanation to the ideas conveyed in the provided image description without mentioning the image.
- Highlight the Uniqueness: Integrate what differentiates the song from others with similar themes into your explanation.
- Casual Tone: Use a casual and fun tone. Avoid suggesting or encouraging sharing, and do not use hashtags.
- Brevity with Depth: Limit the explanation to 1 paragraphs, ensuring clarity and depth.
- No Markdown: Avoid markdown formatting in the response.
- Add More Emojis: Include a generous amount of emojis at the end that represent the song, lyrics, or explanation in a fun and engaging way.

Objective: Produce a concise and vivid explanation in 1 paragraphs that captures the essence of the song, using the visual description as inspiration and ending with plenty of emojis to complement the interpretation.`
        },
        {
          role: 'user',
          name: 'System',
          content: `Track: ${trackTittle} by ${trackArtist}\n\nLyrics: ${lyricsParsed}\n\nLyrics image representation: ${lyricsRepresentation}`
        }
      ],
      max_tokens: 1500
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices explanation generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    let explanationText: string | undefined = explanation.message?.content?.replace(/\n{2,}/g, '\n\n').trim()
    if (explanationText === undefined) {
      advError(`MsOpenAiAPi - No explanation text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No explanation text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          explanationText += '...\n(A explicação foi interrompida por um erro desconhecido)'
          break
        }
        case null: {
          break
        }
        default: {
          advError(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          explanationText += '...\n(A explicação excedeu o limite de caracteres)'
          break
        }
      }
    }

    return {
      success: true,
      explanation: explanationText
    }
  }

  async getLyricsImageDescription (trackTittle: string, trackArtist: string, lyrics: string): Promise<MsOpenAiApiGetLyricsImageDescriptionResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Track: ${trackTittle} by ${trackArtist}\n\nLyrics:\n\n${lyricsParsed}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
`You are an AI specialized in converting song lyrics into detailed prompts for representation generation in another AI. Your primary goal is to create a prompt that results in an representation capturing the essence and emotion of the song, ensuring it is not generic but distinctive from other songs with similar themes. The representation should be visually appealing, not overly cluttered, and can be generated in a wide variety of styles.

Instructions:

Understanding the Song: Analyze the provided song lyrics to identify the main themes, emotions, and evocative imagery. Understand the message and the feeling the song aims to convey.

Prompt Creation:

Construct a prompt that describes a scene or visual element that best represents the song.
Ensure the resulting representation is unique and distinctive, avoiding generic descriptions.
Experiment with different visual styles (e.g., abstract, cartoon, minimalism, digital painting, realism, 3d digital art, etc.) to best capture the essence of the song.
Include details about visual style, lighting, composition, and any other necessary elements to make the representation beautiful and aesthetically pleasing.
Avoid descriptions that could lead to a cluttered or disordered representation.
Ensure the visual representation contains clear references to specific elements or imagery found in the song lyrics, making the connection to the song obvious to the viewer.

Output Format:

Input: Track Tittle and Track Lyrics
Output: Only the representation generation prompt.
Reference Prompts: Here are some example prompts you can use for inspiration:

"Medium shot, Adorable creature with big reflective eyes, moody lighting, best quality, full body portrait, real picture, intricate details, depth of field, in a forest, fujifilm xt3, outdoors, bright day, beautiful lighting, raw photo, 8k uhd, film grain, unreal engine 5, ray tracing"

"portrait | wide angle shot of eyes off to one side of frame, lucid dream-like 3d model of owl, game asset, blender, looking off in distance ::8 style | glowing ::8 background | forest, vivid neon wonderland, particles, blue, green, orange ::7 parameters | rule of thirds, golden ratio, asymmetric composition, hyper-maximalist, octane render, photorealism, cinematic realism, unreal engine, 8k ::7 --ar 16:9 --s 1000"

"An astronaut is looking through her helmet with a horrifying face after a creature is after her. The scene depicts an alien planet with darkness and damp, very realistic"

"3d render, cinematic, candid view, heavy fog with rain, yellow umbrella with woman, London, ultra realistic, 32K UHD resolution, rich detail --ar 9:16"

"Close-up photo of a beautiful red rose breaking through a cube made of ice, splintered cracked ice surface, frosted colors, blood dripping from rose, melting ice, Valentine’s Day vibes, cinematic, sharp focus, intricate, cinematic, dramatic light"

"a 3d model of a Goblin , full body, war ready, detailed, game asset"

Use these examples as a guide to create detailed prompts that result in powerful representations capturing the essence of the song.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating image description for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices image description generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    const imageDescription: string | undefined = explanation.message?.content?.replace(/\n/g, '').trim()
    if (imageDescription === undefined) {
      advError(`MsOpenAiAPi - No image description text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No image description text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Image description for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          advError(`MsOpenAiAPi - Image description for for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          advError(`MsOpenAiAPi - Image description for for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          break
        }
      }
    }

    return {
      success: true,
      description: imageDescription
    }
  }
}
