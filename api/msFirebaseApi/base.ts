import { initializeApp, cert, type App, type ServiceAccount } from 'firebase-admin/app'
import { type Storage, getStorage } from 'firebase-admin/storage'

export interface MsFirebaseApiError {
  success: false
  error: string
}

export type MsFirebaseApiPutFileResponse = {
  success: true
  publicUrl: string
} | MsFirebaseApiError

export type MsFirebaseApiGetFileResponse = {
  success: true
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

  async putFile (filePath: string, fileName: string, fileData: Buffer, fileMetadata: Record<string, string>): Promise<MsFirebaseApiPutFileResponse> {
    const parsedFileName = `${filePath}/${fileName}`
    await this.getStorage().bucket().file(parsedFileName).save(fileData)
    const fileRef = this.getStorage().bucket().file(parsedFileName)
    await fileRef.setMetadata({
      metadata: {
        ...fileMetadata
      }
    })
    await fileRef.makePublic()
    const file = await fileRef.get()
    if (file.length <= 0) {
      return {
        success: false,
        error: 'File not found'
      }
    }
    return {
      success: true,
      publicUrl: file[0].publicUrl()
    }
  }

  async getFile (filePath: string, fileName: string): Promise<MsFirebaseApiGetFileResponse> {
    const parsedFileName = `${filePath}/${fileName}`
    const metadata = await this.getStorage().bucket().file(parsedFileName).getMetadata()
    const customMetadata = metadata[0].metadata
    if (customMetadata === undefined) {
      return {
        success: false,
        error: 'File metadata not found'
      }
    }
    const file = await this.getStorage().bucket().file(parsedFileName).download()
    if (file.length <= 0) {
      return {
        success: false,
        error: 'File not found'
      }
    }
    return {
      success: true,
      metadata: customMetadata,
      file: file[0]
    }
  }
}
