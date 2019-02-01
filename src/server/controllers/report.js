import bodyParser from 'body-parser'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import joi from 'joi'
import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'
import serializeError from 'serialize-error'
import shortHash from 'shorthash'

import config from 'infrastructure/config'
import { analyze } from 'services/analyzer'
import reportService from 'services/report'
import { getSocketServer } from 'socket-server'

const SCHEMA = joi.object().keys({
  url: joi.string().trim().required()
})

export default {
  get: [
    (req, res, next) => {
      res.locals.prettyBytes = prettyBytes
      res.locals.prettyMs = prettyMs

      next()
    },
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

        const time = Date.now()
        const identifier = shortHash.unique(`${ values.url }-${ time }`)

        await reportService.create(identifier, values.url)

        res.redirect(`/reports/${ identifier }`)

        // res.redirect('/')

        try {
          await analyze({
            identifier,
            url: values.url,
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
