const timingMetrics = (metrics) => {
  const dnsLookup = metrics.domainLookupEnd - metrics.domainLookupStart
  const tcpConnect = metrics.connectEnd - metrics.connectStart
  const request = metrics.responseStart - metrics.requestStart
  const response = metrics.responseEnd - metrics.responseStart

  const fullTimeLoad = (metrics.loadEventEnd - metrics.navigationStart)/1000
  const htmlLoadTime = (dnsLookup + tcpConnect + request + response) / 1000

  return {
    htmlLoadTime,
    fullTimeLoad
  }
}

export default timingMetrics
