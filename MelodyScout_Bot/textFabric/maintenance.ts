import { lang } from '../../translations/base'

export function getMaintenanceText (ctxLang: string | undefined, activated: boolean): string {
  const textArray: string[] = []
  switch (activated) {
    case true:
      textArray.push(lang(ctxLang, { key: 'maintenanceModeActivatedInformMessage', value: 'Modo de manutenção ativado!' }))
      break
    case false:
      textArray.push(lang(ctxLang, { key: 'maintenanceModeDeactivatedInformMessage', value: 'Modo de manutenção desativado!' }))
      break
  }
  const text = textArray.join('\n')
  return text
}
