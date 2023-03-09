import path from 'path'
import { AdvConsole } from '../../function/advancedConsole'
import nodeHtmlToImage from 'node-html-to-image'
import fs from 'fs'

interface MsImgFabricApiError {
  success: false
  error: string
}

type MsImgFabricApiGet3x3CollageResponse = {
  success: true
  data: {
    image: Buffer
  }
} | MsImgFabricApiError

export class MsImgFabricApi {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole

    this.advConsole.log('MsFabricApi started!')
  }

  async get3x3Collage (collageData: {
    item1: {
      url: string
      name: string
      description: string
    }
    item2: {
      url: string
      name: string
      description: string
    }
    item3: {
      url: string
      name: string
      description: string
    }
    item4: {
      url: string
      name: string
      description: string
    }
    item5: {
      url: string
      name: string
      description: string
    }
    item6: {
      url: string
      name: string
      description: string
    }
    item7: {
      url: string
      name: string
      description: string
    }
    item8: {
      url: string
      name: string
      description: string
    }
    item9: {
      url: string
      name: string
      description: string
    }
  }): Promise<MsImgFabricApiGet3x3CollageResponse> {
    const htmlPattern = fs.readFileSync(path.join(__dirname, './patterns/3x3Collage.html'), 'utf8')
    const image = await nodeHtmlToImage({
      html: htmlPattern,
      content: {
        url1: collageData.item1.url,
        name1: collageData.item1.name,
        description1: collageData.item1.description,
        url2: collageData.item2.url,
        name2: collageData.item2.name,
        description2: collageData.item2.description,
        url3: collageData.item3.url,
        name3: collageData.item3.name,
        description3: collageData.item3.description,
        url4: collageData.item4.url,
        name4: collageData.item4.name,
        description4: collageData.item4.description,
        url5: collageData.item5.url,
        name5: collageData.item5.name,
        description5: collageData.item5.description,
        url6: collageData.item6.url,
        name6: collageData.item6.name,
        description6: collageData.item6.description,
        url7: collageData.item7.url,
        name7: collageData.item7.name,
        description7: collageData.item7.description,
        url8: collageData.item8.url,
        name8: collageData.item8.name,
        description8: collageData.item8.description,
        url9: collageData.item9.url,
        name9: collageData.item9.name,
        description9: collageData.item9.description
      },
      puppeteerArgs: {
        product: 'firefox'
      }
    }).catch((error) => {
      return new Error(error)
    })
    if (image instanceof Error) {
      this.advConsole.error(`MsImgFabricApi.get3x3Collage: Error while generating image: ${image.message}`)
      return {
        success: false,
        error: image.message
      }
    }
    if (!(image instanceof Buffer)) {
      this.advConsole.error('MsImgFabricApi.get3x3Collage: Error while generating image: image is not a Buffer')
      return {
        success: false,
        error: 'Image is not a Buffer'
      }
    }
    return {
      success: true,
      data: {
        image
      }
    }
  }
}
