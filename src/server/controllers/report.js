import hash from '@emotion/hash'
import bodyParser from 'body-parser'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import joi from 'joi'
import normalizeUrl from 'normalize-url'
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
      const { identifier } = req.params

      const report = await reportService.get(identifier)

      if (!report || report.error) {
        return res.sendStatus(NOT_FOUND)
      }

      res.render('pages/report', {
        report
      })
    }
  ],
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
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
              error: serializeError(e)
            }
          })

          console.error(e)
        }

      } catch (e) {
        return res.sendStatus(500)
      }
    }
  ]

}
