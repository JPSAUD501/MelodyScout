import { melodyScoutConfig } from '../config'

const dividerByteSize = Buffer.byteLength(melodyScoutConfig.divider, 'utf8')

export function getCallbackKey (parameters: string[]): string {
  const callbackId = parameters.shift()
  if (callbackId === undefined) return ''
  const callbackIdByteSize = Buffer.byteLength(callbackId, 'utf8')

  const parameterCount = parameters.length

  const tempMaxParameterByteSize = (64 - callbackIdByteSize - (dividerByteSize * parameterCount)) / parameterCount

  const remainingByteSizeArray: number[] = []

  for (let i = 1; i < parameters.length; i++) {
    const parameter = parameters[i]
    const parameterByteSize = Buffer.byteLength(parameter, 'utf8')
    if (parameterByteSize < tempMaxParameterByteSize) {
      remainingByteSizeArray.push(tempMaxParameterByteSize - parameterByteSize)
    }
  }

  const remainingByteSize = remainingByteSizeArray.reduce((a, b) => a + b, 0)

  const maxLongParameterByteSize = tempMaxParameterByteSize + (remainingByteSize / (parameterCount - remainingByteSizeArray.length))

  const slicedParameters: string[] = []

  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i]
    while (Buffer.byteLength(parameter, 'utf8') > maxLongParameterByteSize) {
      if (parameter.endsWith('…')) parameter = parameter.slice(0, -1)
      parameter = parameter.slice(0, -1) + '…'
      if (parameter.endsWith(' …')) parameter = parameter.slice(0, -2) + '…'
    }
    slicedParameters.push(parameter)
  }

  const callbackKey = `${callbackId}${melodyScoutConfig.divider}${slicedParameters.join(melodyScoutConfig.divider)}`
  return callbackKey
}
