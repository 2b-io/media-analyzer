import { analyzeByDevice } from './analyze-by-device'
import { runLighthouse } from './run-lighthouse'

const createNotifier = (identifier) => ({
  notify: (message, isCompleted) => {
    if (isCompleted) {
      console.timeEnd(`[${identifier}] ${message}`)

      return
    }

    console.log(`[${identifier}] ${message}...`)
    console.time(`[${identifier}] ${message}`)
  }
})

export const analyze = async (cluster, identifier, url) => {
  const notifier = createNotifier(identifier)

  const [
    mobile,
    desktop,
    lighthouse
   ] = await Promise.all([
    analyzeByDevice(cluster, identifier, url, 'mobile', notifier.notify),
    analyzeByDevice(cluster, identifier, url, 'desktop', notifier.notify),
    runLighthouse(cluster, identifier, url, notifier.notify)
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
