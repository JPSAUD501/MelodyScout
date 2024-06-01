import { initializeApp, cert, type App, type ServiceAccount } from 'firebase-admin/app'
import { type Storage, getStorage } from 'firebase-admin/storage'

export interface MsFirebaseApiError {
  success: false
  error: string
}

export type MsFirebaseApiGetFileResponse = {
  success: true
  publicUrl: string
  metadata: Record<string, any>
  file: Buffer
} | MsFirebaseApiError

export class MsFirebaseApi {
  private readonly client: App

  constructor (serviceAccountBase64: string, bucketName: string) {
    this.client = initializeApp({
      credential: cert(JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString()) as ServiceAccount),
      storageBucket: `${bucketName}.appspot.com`
    })
  }

  getClient (): App {
    return this.client
  }

  getStorage (): Storage {
    return getStorage(this.client)
  }

  async putFile (filePath: string, fileName: string, fileData: Buffer, fileMetadata: Record<string, string>): Promise<MsFirebaseApiGetFileResponse> {
    const parsedFileName = `${filePath}/${fileName}`
    await this.getStorage().bucket().file(parsedFileName).save(fileData)
    const fileRef = this.getStorage().bucket().file(parsedFileName)
    await fileRef.setMetadata({
      metadata: {
        ...fileMetadata
      }
    })
    await fileRef.makePublic()
    await new Promise(resolve => setTimeout(resolve, 1000))
    return await this.getFile(filePath, fileName)
  }

  async getFile (filePath: string, fileName: string): Promise<MsFirebaseApiGetFileResponse> {
    const parsedFileName = `${filePath}/${fileName}`
    const fileRef = this.getStorage().bucket().file(parsedFileName)
    const publicUrl = fileRef.publicUrl()
    const allMetadata = await fileRef.getMetadata()
    const metadata = allMetadata[0].metadata
    if (metadata === undefined) {
      return {
        success: false,
        error: 'File metadata not found'
      }
    }
    const file = await fileRef.download()
    if (file.length <= 0) {
      return {
        success: false,
        error: 'File not found'
      }
    }
    return {
      success: true,
      publicUrl,
      metadata,
      file: file[0]
    }
  }
}
