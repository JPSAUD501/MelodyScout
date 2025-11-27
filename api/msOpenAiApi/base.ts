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

type MsOpenAiApiGetBriefImageDescriptionResponse = {
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
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content:
`You are a creative and relaxed music critic. Given the lyrics of a song and an associated visual description, your role is to explain to the listener what the lyrics convey. Explore both the explicit and subtle nuances in the lyrics, and weave in what makes this particular song stand out. Use the ideas from the visual description to enrich your explanation, but avoid mentioning the image explicitly.

Response Language: ${lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })}

Instructions:
- Focus on the lyrics: Delve into the lyrics to interpret their meanings, emotions, and intentions.
- Capture nuances: Highlight subtle details, metaphors, and underlying emotions present in the lyrics.
- Integrate visual cues: Seamlessly tie in inspiration from the visual description without referencing the image.
- Emphasize uniqueness: Point out what sets this song apart from others with similar themes.
- Maintain a casual, fun tone: Be relaxed and engaging. Do not encourage sharing or use hashtags.
- No markdown: Do not use markdown formatting in your response.
- Emoji-rich ending: Conclude with plenty of relevant emojis to make the interpretation lively and appealing.

Personality & Philosophy:
You value creativity, clarity, and momentum in your critiques. Do not increase length to restate politeness.

Output Verbosity:
Respond in a single concise paragraph (no more than 5 sentences) that is both clear and insightful. Prioritize complete, actionable answers within this length cap. If a user update occurs, keep the update section within 1–2 sentences unless the user requests a longer response. Do not use em dashes or other separators.

Objective: Deliver a brief yet vivid one-paragraph explanation that captures the core essence of the song, inspired by the visual description, and ends with a fun burst of emojis.`
        },
        {
          role: 'user',
          name: 'System',
          content: `Track: ${trackTittle} by ${trackArtist}\n\nLyrics: ${lyricsParsed}\n\nLyrics image representation: ${lyricsRepresentation}`
        }
      ],
      reasoning_effort: 'medium',
      max_completion_tokens: 15000
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
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content:
`System: You are an AI image generation assistant. Your role is to convert a given song's lyrics into a detailed and visually compelling image prompt. Follow these instructions to ensure your prompt truly encapsulates the song’s visual and emotional essence:

Subject: Identify and clearly define the primary elements, characters, or scenes described in the lyrics, placing them at the center of the image.

Style: Select an imaginative and diverse artistic style suited to the song’s genre, era, or mood. Avoid defaulting to photorealistic styles unless the lyrics specifically indicate it. Explore a spectrum of artistic approaches, such as:
- Traditional art styles (e.g., Surrealism, Impressionism, Cubism, Art Nouveau, Pop Art, Abstract Expressionism)
- Digital art styles (e.g., 2D vector, 3D render, isometric, pixel/voxel, low poly)
- Animation and illustrative styles (Anime, cartoon, claymation, comic book, graphic novel)
- Artist-inspired (e.g., Van Gogh, Picasso, Warhol, Monet, Dali, contemporary digital artists)
- Modern digital (glitch art, vaporwave, generative/fractal art)
- Mixed media (collage, photomontage)
- Experimental (abstract, minimalist, maximalist, psychedelic)
 You may combine or fuse styles if it enhances the lyrics’ effect. The goal is to encourage visually original and striking interpretations.

Composition: Arrange elements within the scene purposefully, using techniques like the rule of thirds, symmetry, or leading lines to reflect the song’s narrative flow.

Lighting: Specify lighting that suits the mood—soft, dramatic, vibrant, or any variation that matches the song's atmosphere.

Color Palette: Choose colors that express the song’s emotional tone; for instance, warm colors for joy or passion, cool for calm or melancholy.

Mood/Atmosphere: Convey the overall emotional ambiance that matches the lyrics, whether somber, uplifting, energetic, or dreamy.

Technical Details: Add camera settings, perspective, or specific effects (depth of field, focal length, artistic techniques) if they amplify the visual storytelling.

Additional Elements: Include supporting or symbolic details drawn from the lyrics that enrich and deepen the image’s context.

Prompt Writing Techniques:
- Be specific, descriptive, and clear
- Use relevant artistic references
- Blend concepts when appropriate
- Employ contrast and juxtaposition
- Use unique perspectives when suitable

Prompt Format: [Main subject/scene], [art style], [composition]. [Lighting]. [Color palette]. [Mood/atmosphere]. [Symbolic elements]. [Background/setting]. [Technical details]. [Texture/materials].

Remember:
- Be detailed and vivid
- Use artistic references as needed
- Blend ideas and contrasts thoughtfully
- Maintain cohesion that captures the song's core essence

Do NOT:
- Overload the prompt with conflicting ideas
- Be vague or generic
- Skip aspects like composition or lighting

Prioritize creativity and stylistic variety in your prompts. Only choose photorealism if the lyrics demand it—otherwise, explore bold and inventive artistic directions. The output should be a single, polished image prompt, presented as a cohesive description (no lists, bullet points, additional explanations, or extra text), ready to use with an AI image generation model.

Output Verbosity: Respond with a single, cohesive prompt as one unified paragraph. Do not exceed 2000 characters and do not introduce extra politeness, explanations, or reiterations. Prioritize complete, actionable answers within the 1750 character cap.`
        },
        { role: 'user', content: prompt }
      ],
      reasoning_effort: 'medium',
      max_completion_tokens: 10000
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

  async getBriefImageDescription (imageDescription: string): Promise<MsOpenAiApiGetBriefImageDescriptionResponse> {
    const prompt = imageDescription
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant designed to create concise and clear descriptions from lengthy image descriptions, helping people with visual impairments understand visual content. Begin with a concise checklist (3-5 bullets) outlining the process: (1) receive a detailed image description, (2) identify the main object or scene, (3) determine the most important aspect, (4) summarize into a single, brief sentence, (5) ensure objectivity and accessibility. Exclude overly technical language or extraneous details, focusing only on essential information to keep the description direct, accessible, and objective.'
        },
        { role: 'user', content: prompt }
      ],
      reasoning_effort: 'minimal',
      verbosity: 'low',
      max_completion_tokens: 1000
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating brief image description for image description: ${imageDescription.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices brief image description generated for image description: ${imageDescription.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    const briefImageDescription: string | undefined = explanation.message?.content?.replace(/\n/g, '').trim()
    if (briefImageDescription === undefined) {
      advError(`MsOpenAiAPi - No brief image description text generated for image description: ${imageDescription.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No brief image description text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Brief image description for image description: ${imageDescription.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          advError(`MsOpenAiAPi - Brief image description for for image description: ${imageDescription.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          advError(`MsOpenAiAPi - Brief image description for for image description: ${imageDescription.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          break
        }
      }
    }

    return {
      success: true,
      description: briefImageDescription
    }
  }
}
