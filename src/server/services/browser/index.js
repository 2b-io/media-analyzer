import ms from 'ms'
import { Cluster } from 'puppeteer-cluster'
import os from 'os'

import config from 'infrastructure/config'

export default {
  async createCluster() {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: os.cpus().length,
      // monitor: true,
      puppeteerOptions: {
        headless: true,
        // executablePath: 'google-chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1440,900',
          '--proxy-server="direct://"',
          '--proxy-bypass-list=*',
          '--enable-features=NetworkService',
          '--disk-cache-size=0' // disable cache
        ],
        ignoreHTTPSErrors: true
      },
      timeout: ms(config.optimizerTimeout || '3m') + ms('3m'),
      workerCreationDelay: ms('1s')
    })

    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    })

    return cluster
  }
}
