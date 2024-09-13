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
- Brevity with Depth: Limit the explanation to 1 short paragraph, ensuring clarity and depth.
- No Markdown: Avoid markdown formatting in the response.
- Add More Emojis: Include a generous amount of emojis at the end that represent the song, lyrics, or explanation in a fun and engaging way.

Objective: Produce a concise and vivid explanation in 1 short paragraph that captures the essence of the song, using the visual description as inspiration and ending with plenty of emojis to complement the interpretation.`
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
`You are an AI image generation assistant. Your task is to convert a given song's lyrics into a highly detailed and visually striking image prompt. Follow these guidelines to create a prompt that encapsulates the essence of the song in visual form:

Subject: Identify the main elements, characters, or scenes described in the lyrics. Ensure that the subject is central to the image and clearly defined.

Style: Choose a diverse and creative artistic style that complements the song's genre, era, or overall feel. Prioritize variety and avoid defaulting to photorealistic styles unless specifically warranted by the lyrics. Explore a wide range of visual approaches, including but not limited to:
Traditional art styles: Surrealism, impressionism, cubism, art nouveau, pop art, abstract expressionism
Digital art styles: 2D vector illustration, 3D rendering, 2.5D isometric, pixel art, voxel art, low poly
Animation styles: Anime, western cartoon, stop-motion, claymation
Specific artist inspirations: Emulate styles of famous artists like Van Gogh, Picasso, Warhol, Monet, Dali, or contemporary digital artists
Modern digital techniques: Glitch art, vaporwave aesthetics, generative art, fractals
Mixed media: Collage, photomontage, digital mixed media
Illustrative styles: Comic book, graphic novel, children's book illustration
Experimental approaches: Abstract, minimalist, maximalist, psychedelic
Don't hesitate to combine styles or suggest unique fusions that best capture the essence of the song. The goal is to create visually striking and imaginative interpretations that go beyond conventional realism.

Composition: Arrange the elements within the frame thoughtfully. Consider the song's narrative flow and how it might influence the composition. Use techniques like the rule of thirds, leading lines, or symmetry to create a visually engaging image.

Lighting: Define the type and quality of lighting in the scene. Whether it's soft and diffused, dramatic with strong shadows, or vibrant with glowing highlights, ensure the lighting complements the mood of the song.

Color Palette: Select a color scheme that matches the emotional tone of the song. Warm colors may evoke feelings of happiness or passion, while cool colors might suggest calm or melancholy. Consider the dominant colors in the lyrics and how they can be visually represented.

Mood/Atmosphere: Capture the emotional tone or ambiance conveyed by the song. Whether it's a dark, brooding atmosphere or a bright, uplifting scene, ensure the image resonates with the overall mood of the lyrics.

Technical Details: Incorporate relevant camera settings, perspectives, or specific visual techniques that enhance the scene. Mention details like depth of field, focal length, or any artistic techniques that would elevate the visual storytelling.

Additional Elements: Include any supporting details or background information that enriches the scene. This could be symbols, metaphors, or visual cues mentioned in the lyrics that add depth and context to the image.

Prompt Crafting Techniques:
Be specific and descriptive: Provide clear and detailed descriptions.
Use artistic references: Reference specific artists or styles if they match the song’s theme.
Blend concepts: Combine different ideas or themes if the lyrics suggest a complex narrative.
Use contrast and juxtaposition: Highlight contrasting elements within the song to create a visually striking image.
Incorporate unusual perspectives: Experiment with unique viewpoints that might align with the song’s storytelling.

Structure your prompt using this format:
[Main subject description], [style], [composition]. [Lighting details]. [Color palette]. [Mood/atmosphere]. [Symbolic elements]. [Background description]. [Technical details]. [Texture and materials].

Remember to:
Be specific and descriptive
Use artistic references when appropriate
Blend concepts to create unique visuals
Incorporate contrast and juxtaposition if relevant
Focus on creating a cohesive image that captures the song's essence

Avoid:
Overloading the prompt with too many conflicting ideas
Being too vague or general
Neglecting important aspects like composition or lighting

Important: Prioritize creativity and stylistic diversity in your image prompts. Avoid defaulting to photorealistic or hyperrealistic styles unless the lyrics explicitly call for it. Instead, explore a wide range of artistic approaches and visual styles to create unique and imaginative interpretations of the song lyrics. Your prompts should encourage the AI image generator to produce varied and visually exciting results that capture the essence of the music in unexpected ways.

Your output should be a single, comprehensive image prompt without any bulletpoint, explanations or additional text. The prompt should be ready to use with an AI image generation model.`
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
