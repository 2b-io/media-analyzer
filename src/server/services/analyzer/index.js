import { analyzeByDevice } from './analyze-by-device'
import { runLighthouse } from './run-lighthouse'

export { summarizeMetrics } from './scoring'

export const analyze = async (cluster, identifier, url, updateProgress) => {
  const [
    mobile,
    desktop,
    lighthouse
   ] = await Promise.all([
    analyzeByDevice(cluster, identifier, url, 'mobile', updateProgress),
    analyzeByDevice(cluster, identifier, url, 'desktop', updateProgress),
    runLighthouse(cluster, identifier, url, updateProgress)
  ])

  return {
    mobile: {
      ...mobile,
      lhr: lighthouse.mobile.lhr
    },
    desktop: {
      ...desktop,
      lhr: lighthouse.desktop.lhr
    }
  }
}
