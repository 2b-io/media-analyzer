import fs from 'fs-extra'
import mime from 'mime'
import path from 'path'
import prettyMs from 'pretty-ms'

import config from 'infrastructure/config'

const reportDetail = async (identifier, reportName) => {
  const { log } = await fs.readJson(path.join(config.harDir, `${ identifier }-${ reportName }.har`))

  const requests = log.entries.map((element) => {
    const {
      timings: {
        blocked,
        dns,
        connect,
        send,
        wait,
        receive,
        _queued: queued
      },
      request: {
        url
      },
      response: {
        status,
        content: {
          mimeType
        }
      }
    } = element
    return {
      status,
      url,
      contentType: mime.getExtension(mimeType) || mimeType,
      blockedPercent: Math.max(0, ((blocked * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      dnsPercent: Math.max(0, ((dns * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      connectPercent: Math.max(0, ((connect * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      sendPercent: Math.max(0, ((send * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      waitPercent: Math.max(0, ((wait * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      receivePercent: Math.max(0, ((receive * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
      totalTime: prettyMs(blocked + dns + connect + send + wait + receive),
      queuedStart: ((Date.parse(element.startedDateTime) - Date.parse(log.pages[0].startedDateTime)) * 100) / log.pages[0].pageTimings.onLoad
    }
  }).reduce((all, element) => {
    all[ element.url ] = element
    return all
}, {})

  return requests
}

export default reportDetail
