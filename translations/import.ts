import fs from 'fs'
import axios from 'axios'

export async function importTranslation (): Promise<{
  success: true
} | {
  success: false
  error: string
}> {
  try {
    const urls = {
      ptBR: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/pt_BR.json',
      enUS: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/en.json',
      jaJP: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/ja.json'
    }

    for (const lang in urls) {
      const response = await axios.get(urls[lang]).catch((error) => {
        return new Error(error)
      })
      if (response instanceof Error) {
        return {
          success: false,
          error: `Error on importing translations: ${response.message}`
        }
      }
      const json = response.data as Record<string, string>
      const textArray: string[] = []
      textArray.push(`export const ${lang} = {`)
      for (const key in json) {
        let value: string = json[key]
        value = value.replaceAll('\n', '\\n')
        switch (true) {
          case (value.includes("'") && value.includes('"')):
            value = `'${value.replaceAll("'", "\\'")}'`
            break
          case (value.includes("'")):
            value = `"${value}"`
            break
          case (value.includes('"')):
            value = `'${value}'`
            break
          default:
            value = `'${value}'`
        }
        let finalString = `  ${key}: ${value}`
        if (Object.keys(json).indexOf(key) < Object.keys(json).length - 1) {
          finalString += ','
        }
        textArray.push(`${finalString}`)
      }
      textArray.push('}')
      textArray.push('')
      const text = textArray.join('\n')
      if (!fs.existsSync('./translations/languages')) {
        fs.mkdirSync('./translations/languages')
      }
      if (fs.existsSync(`./translations/languages/${lang}.ts`)) {
        const content = fs.readFileSync(`./translations/languages/${lang}.ts`).toString()
        if (content === text) {
          console.log(`File ${lang}.ts is already up to date!`)
          continue
        }
      }
      fs.writeFileSync(`./translations/languages/${lang}.ts`, text)
      console.log(`File ${lang}.ts was created!`)
    }
  } catch (error) {
    return {
      success: false,
      error: `Error on importing translations: ${String(error)}`
    }
  }
  return {
    success: true
  }
}

importTranslation().then((result) => {
  if (!result.success) {
    console.error(result.error)
  }
}).catch((error) => {
  console.error(error)
})
