export function getHelpText (): string {
  const textArray: string[] = [
    '<b>Meus comandos!</b>',
    '',
    '<b>/start</b> - Inicia o bot',
    '<b>/help</b> - Mostra essa linda mensagem',
    '<b>/contact</b> - Mostra o contato do desenvolvedor',
    '',
    '<b>Aguarde! Mais comandos estão por vir!</b>'
  ]
  const text = textArray.join('\n')
  return text
}
