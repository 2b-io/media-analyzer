import hash from '@emotion/hash'
import bodyParser from 'body-parser'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import joi from 'joi'
import ms from 'ms'
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

        res.render('pages/report-detail', {
          report: {
            ...report
          }
        })
      } catch (e) {
        console.error(e)

        return res.redirect('/')
      }
    }
  ]
}
