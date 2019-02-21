import hash from '@emotion/hash'
import bodyParser from 'body-parser'
import fs from 'fs-extra'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import joi from 'joi'
import ms from 'ms'
import normalizeUrl from 'normalize-url'
import path from 'path'
import prettyMs from 'pretty-ms'
import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import { analyze } from 'services/analyzer'
import reportService from 'services/report'
import { getSocketServer } from 'socket-server'

const SCHEMA = joi.object().keys({
  url: joi.string().trim().required()
})

export default {
  get: [
    async (req, res, next) => {
      try {
        const { identifier } = req.params

        const report = await reportService.get(identifier)

        if (!report) {
          // return res.sendStatus(NOT_FOUND)
          return res.redirect('/')
        }

        if (!report.finish) {
          return res.render('pages/report-detail', { report })
        }
        const { log } = await fs.readJson(path.join(config.harDir, `${ identifier }-desktop-optimized.har`))

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
            }
          } = element
          return {
            ...element,
            blockedPercent: Math.max(0, ((blocked * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            dnsPercent: Math.max(0, ((dns * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            connectPercent: Math.max(0, ((connect * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            sendPercent: Math.max(0, ((send * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            waitPercent: Math.max(0.1, ((wait * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            receivePercent: Math.max(0, ((receive * 100) / log.pages[0].pageTimings.onLoad).toFixed(2)),
            totalTime: prettyMs(blocked + dns + connect + send + wait + receive),
            queuedStart: ((Date.parse(element.startedDateTime) - Date.parse(log.pages[0].startedDateTime)) * 100) / log.pages[0].pageTimings.onLoad
          }
        })

        const desktopOriginalHar = {
          requests,
          onLoad: log.pages[0].pageTimings.onLoad,
          startTime: Date.parse(log.pages[0].startedDateTime)
        }

        res.render('pages/report-detail', {
          report: {
            ...report,
            desktopOriginalHar
          }
        })
      } catch (e) {
        console.error(e)

        return res.redirect('/')
      }
    }
  ]
}
