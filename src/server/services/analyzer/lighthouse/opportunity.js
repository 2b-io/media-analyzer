const opportunity = (audits) => {
  return Object.values(audits).filter((audit) => {
    if (audit.details != null &&
      audit.details.type == 'opportunity' &&
      audit.details.overallSavingsBytes != null &&
      audit.details.overallSavingsBytes > 0 &&
      audit.details.overallSavingsMs > 0
    ) {
      return audit
    }
    return null
  }).sort((lastElement, nextElement) => {
    return nextElement.details.overallSavingsMs - lastElement.details.overallSavingsMs
  })
}

export default opportunity
