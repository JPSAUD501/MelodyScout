import { lang } from '../../translations/base'

export function getMaintenanceText (ctxLang: string | undefined, activated: boolean): string {
  const textArray: string[] = []
  switch (activated) {
    case true:
      textArray.push(lang(ctxLang, 'maintenanceModeActivatedInformMessage'))
      break
    case false:
      textArray.push(lang(ctxLang, 'maintenanceModeDeactivatedInformMessage'))
      break
  }
  const text = textArray.join('\n')
  return text
}
