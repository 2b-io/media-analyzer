const reports = {}

export default {
  get: tag => reports[tag],
  set: (tag, report) => reports[tag] = report
}
