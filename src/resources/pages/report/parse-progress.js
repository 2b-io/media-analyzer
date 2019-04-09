const countBit = (mask) => ((mask || '').match(/1/g) || []).length

export const parseProgress = (current, finish) => {
  const finishMask = finish.toString(2)
  const currentMask = current.toString(2)

  const numberOfDone = countBit(currentMask)
  const total = countBit(finishMask)

  return Math.max(0, Math.min(100, Math.round(numberOfDone / total * 100)))
}
