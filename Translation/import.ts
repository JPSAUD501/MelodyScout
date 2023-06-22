import fs from 'fs'
import axios from 'axios'

async function importTranslation (): Promise<void> {
  try {
    const urls = {
      ptBR: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/pt_BR.json',
      enUS: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/en.json',
      jaJP: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout-Translation/main/ja.json'
    }

    for (const lang in urls) {
      const response = await axios.get(urls[lang])
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
      fs.writeFileSync(`./translation/languages/${lang}.ts`, textArray.join('\n'))
      console.log(`File ${lang}.ts was created!`)
    }
  } catch (error) {
    console.error('A error occurred while importing the translation files!', error)
  }
}

importTranslation().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
