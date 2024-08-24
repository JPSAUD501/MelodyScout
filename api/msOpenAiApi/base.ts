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

type MsOpenAiApiGetLyricsEmojisResponse = {
  success: true
  emojis: string
} | MsOpenAiApiError

export class MsOpenAiApi {
  private readonly openai: OpenAI

  constructor (openAiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAiApiKey
    })
  }

  async getLyricsExplanation (ctxLang: string | undefined, lyrics: string): Promise<MsOpenAiApiGetLyricsExplanationResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `${lyricsParsed}\n\n${lang(ctxLang, { key: 'lyricsExplanationAiPrompt', value: 'Explicação resumida da letra da música:' })}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You help users understand the lyrics of the tracks they listened.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 425,
      temperature: 0.7
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
    // console.log(explanation)
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

  async getLyricsImageDescription (lyrics: string): Promise<MsOpenAiApiGetLyricsImageDescriptionResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Lyrics:\n\n${lyricsParsed}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
`You are an AI specialized in converting song lyrics into detailed prompts for representation generation in another AI. Your primary goal is to create a prompt that results in a representation capturing the essence and emotion of the song, ensuring it is not generic but distinctive from other songs with similar themes. The representation should be visually appealing, not overly cluttered, and can be generated in a wide variety of styles.

Instructions:

Understanding the Song: Analyze the provided song lyrics to identify the main themes, emotions, and evocative imagery. Understand the message and the feeling the song aims to convey.

Prompt Creation:

Construct a prompt that describes a scene or visual element that best represents the song.
Ensure the resulting representation is unique and distinctive, avoiding generic descriptions.
Experiment with different visual styles (e.g., surrealism, abstract, cartoon, minimalism, digital painting, realism) to best capture the essence of the song.
Include details about visual style, lighting, composition, and any other necessary elements to make the representation beautiful and aesthetically pleasing.
Representation Style:

Encourage a variety of styles (not limited to realism; consider surrealism, abstract, minimalism, digital art, 3D art, 2D art, black and white, etc.), while always focusing on creating something visually impactful.
Avoid descriptions that could lead to a cluttered or disordered representation.
Output Format:

Input: Song lyrics
Output: Only the representation generation prompt.
Reference Prompts: Here are some example prompts you can use for inspiration:

"Medium shot, Adorable creature with big reflective eyes, moody lighting, best quality, full body portrait, real picture, intricate details, depth of field, in a forest, fujifilm xt3, outdoors, bright day, beautiful lighting, raw photo, 8k uhd, film grain, unreal engine 5, ray tracing"

"Portrait | Wide angle shot of eyes off to one side of frame, lucid dream-like 3D model of owl, game asset, Blender, looking off in distance ::8 style | Glowing ::8 background | Forest, vivid neon wonderland, particles, blue, green, orange ::7 parameters | Rule of thirds, golden ratio, asymmetric composition, hyper-maximalist, octane render, photorealism, cinematic realism, unreal engine, 8k ::7 --ar 16:9 --s 1000"

"An astronaut is looking through her helmet with a horrified expression as a creature approaches her. The scene depicts an alien planet with darkness and dampness, very realistic"

"3D render, cinematic, candid view, heavy fog with rain, yellow umbrella with a woman, London, ultra-realistic, 32K UHD resolution, rich detail --ar 9:16"

"Close-up photo of a beautiful red rose breaking through a cube made of ice, splintered cracked ice surface, frosted colors, blood dripping from the rose, melting ice, Valentine’s Day vibes, cinematic, sharp focus, intricate, dramatic light"

"The Cultural Revolution meets pop art, close-up shot of yellow eyes and black hair, holding a katana, manga style, in a colorful comic book warrior costume, Mike Mayhew-inspired by Massimo Vignelli combined with Orphism, neon palette, energetic blue background painted --niji 5"

Use these examples as a guide to create detailed prompts that result in powerful representations capturing the essence of the song.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 1
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

  async getLyricsEmojis (lyrics: string): Promise<MsOpenAiApiGetLyricsEmojisResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Lyrics:\n\n${lyricsParsed}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Using the lyrics received, create a selection of emojis that best represent the song. The answer must only contain emojis. The answer must have up to 40 emojis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices emojis generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    // Remove new line, letters and numbers
    const emojisText: string | undefined = explanation.message?.content?.replace(/\n/g, '').replace(/[a-zA-Z0-9]/g, '').trim()
    if (emojisText === undefined) {
      advError(`MsOpenAiAPi - No emojis text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No emojis text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          break
        }
      }
    }

    return {
      success: true,
      emojis: emojisText
    }
  }
}
