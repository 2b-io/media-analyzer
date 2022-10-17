import asynk from 'async'
import hash from '@emotion/hash'
import bodyParser from 'body-parser'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import joi from 'joi'
import ms from 'ms'
import normalizeUrl from 'normalize-url'
import pick from 'object.pick'
import serializeError from 'serialize-error'
import uuid from 'uuid'

import config from 'infrastructure/config'
import { analyze, summarizeMetrics } from 'services/analyzer'
import reportService from 'services/report'
import { FINISH, TYPES } from 'services/report/watcher'
import { getSocketServer } from 'socket-server'

const SCHEMA = joi.object().keys({
  url: joi.string().trim().required(),
  optimize: joi.boolean()
})

export default {
  get: [
    (req, res, next) => {
      res.locals.TYPES = TYPES
      res.locals.FINISH = FINISH

      next()
    },
    async (req, res, next) => {
      try {
        const { identifier } = req.params

        const report = await reportService.get(identifier)

        if (!report) {
          // return res.sendStatus(NOT_FOUND)
          return res.redirect('/')
        }

        if (report.error) {
          return res.render('pages/report', {
            report
          })
        }

        if (!report.finish
          || report.process !== TYPES.FINISH
        ) {
          if (Date.now() - report.createdAt > ms('5m')) {
            // mark as not able to finish
            const watcher = reportService.createWatcher(identifier)

            await watcher.finish('Timeout 10m')
          }

          return res.render('pages/report', {
            report: {
              ...report,
              error: Date.now() - report.createdAt > ms('5m')
            }
          })
        }

        const metrics = summarizeMetrics(report.data)

        res.render('pages/report', {
          report: pick(report, [
            'identifier',
            'error',
            'finish',
            'progress',
            'url',
            'createdAt',
            'updatedAt'
          ]),
          metrics
        })

      } catch (e) {
        console.error(e)

        return res.redirect('/')
      }
    }
  ],
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      const { browserCluster } = req.app.locals

      if (!browserCluster) {
        return res.json({
          error: 'No Browser Cluster'
        })
      }

      const body = req.body
      const values = await joi.validate(body, SCHEMA)

      const optimize = values.optimize === undefined ? true : false

      const { identifier, url } = await reportService.create({
        url: normalizeUrl(values.url, {
          stripWWW: false
        }),
        optimize
      })

      const watcher = reportService.createWatcher(identifier)

      res.redirect(`/reports/${ identifier }`)

      try {
        await analyze(browserCluster, identifier, url, optimize, watcher.updateProgress)
      } catch (e) {
        console.log('NOT ABLE TO FINISH ANALYZING!', e)

        await watcher.finish(e)
      } finally {
        await watcher.finish()
      }
    }
  ],
  _post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      return res.json({
        ok: true
      })

      try {
        const body = req.body
        const values = await joi.validate(body, SCHEMA)

        const url = normalizeUrl(values.url, {
          stripWWW: false
        })
        const time = Date.now()
        const identifier = hash(`${ url }-${ time }`)

        await reportService.create(identifier, url)

        res.redirect(`/reports/${ identifier }`)

        try {
          await analyze({
            identifier,
            url: url,
            timeout: config.optimizerTimeout
          })
        } catch (e) {
          await reportService.update(identifier, {
            error: true
          })

          const socketServer = getSocketServer()

          socketServer.to(identifier).emit('analyze:failure', {
            payload: {
              error: true
            }
          })

          console.error(e)
        }
      } catch (e) {
        return res.redirect('/')
      }
    }
  ]

}
