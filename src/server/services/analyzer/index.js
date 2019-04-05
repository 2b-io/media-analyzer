import { analyzeByDevice } from './analyze-by-device'
import { runLighthouse } from './run-lighthouse'

export const analyze = async (cluster, identifier, url) => {
  const [ mobile, desktop, lighthouse ] = await Promise.all([
    analyzeByDevice(cluster, identifier, url, 'mobile'),
    analyzeByDevice(cluster, identifier, url, 'desktop'),
    runLighthouse(cluster, identifier, url)
  ])

  return {
    mobile: {
      ...mobile,
      lhs: lighthouse.mobile.lhr.categories.performance.score
    },
    desktop: {
      ...desktop,
      lhs: lighthouse.desktop.lhr.categories.performance.score
    }
  }
}
