import { enUS } from './languages/enUS'
import { ptBR } from './languages/ptBR'
import { jaJP } from './languages/jaJP'

export type Language = typeof enUS & typeof ptBR & typeof jaJP

export const lang: Record<string, Language> = {
  enUS,
  ptBR,
  jaJP
}
