import axios from 'axios'

export async function downloadImage (url: string): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  console.log(`Downloading image from ${url}`)
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })
    const imageBuffer = Buffer.from(response.data, 'binary')

    return {
      success: true,
      image: imageBuffer
    }
  } catch (error) {
    return {
      success: false,
      error: `Error downloading image: ${String(error)}`
    }
  }
}
