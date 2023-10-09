import { lang } from '../../translations/base'

export function getMaintenanceinformText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, 'maintenanceInformMessage'))
  const text = textArray.join('\n')
  return text
}
