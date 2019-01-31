const calculateSpeedPage = async (page) => {
  const rawMetrics = await page.evaluate(() => {
    return JSON.stringify(window.performance.timing)
  })

  const metrics = JSON.parse(rawMetrics)

  const dnsLookup = (metrics.domainLookupEnd - metrics.domainLookupStart)/1000
  const tcpConnect = (metrics.connectEnd - metrics.connectStart)/1000
  const timeToFirstByte  = (metrics.responseStart - metrics.requestStart)/1000
  const response = (metrics.responseEnd - metrics.responseStart)/1000

  const fullTimeLoad = (metrics.loadEventEnd - metrics.navigationStart)/1000
  const htmlLoadTime = dnsLookup + tcpConnect + timeToFirstByte + response

  const result = {
    dnsLookup,
    tcpConnect,
    htmlLoadTime,
    timeToFirstByte,
    response,
    fullTimeLoad
  }

  return result
}

export default calculateSpeedPage
