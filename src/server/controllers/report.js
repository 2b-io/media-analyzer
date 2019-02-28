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

        if (!report.finish || !report.desktop || !report.mobile) {
          return res.render('pages/report', { report })
        }

        // calculate optimized score here
        const {
          desktop: {
            original: {
              loadTime: desktopOriginalLoadTime,
              downloadedBytes: desktopOriginalPageSize
            },
            optimized: {
              loadTime: desktopOptimizedLoadTime,
              downloadedBytes: desktopOptimizedPageSize
            },
            originalPerformanceScore: desktopOriginalScore
          },
          mobile: {
            original: {
              loadTime: mobileOriginalLoadTime,
              downloadedBytes: mobileOriginalPageSize
            },
            optimized: {
              loadTime: mobileOptimizedLoadTime,
              downloadedBytes: mobileOptimizedPageSize
            },
            originalPerformanceScore: mobileOriginalScore
          }
        } = report

        const metrics = {
          desktop: {
            score: {
              original: desktopOriginalScore
            },
            loadTime: {
              original: desktopOriginalLoadTime,
              optimized: desktopOptimizedLoadTime
            },
            pageSize: {
              original: desktopOriginalPageSize,
              optimized: desktopOptimizedPageSize
            }
          },
          mobile: {
            score: {
              original: mobileOriginalScore
            },
            loadTime: {
              original: mobileOriginalLoadTime,
              optimized: mobileOptimizedLoadTime
            },
            pageSize: {
              original: mobileOriginalPageSize,
              optimized: mobileOptimizedPageSize
            }
          }
        }

        const target = {
          loadTime: ms('1s'),
          pageSize: 1000000 // ~2mb
        }

        // const target = {
        //   loadTime: 0,
        //   pageSize: 0
        // }

        const needImprove = {
          desktop: {
            score: 100 - metrics.desktop.score.original,
            loadTime: {
              original: Math.max(1, metrics.desktop.loadTime.original - target.loadTime),
              optimized: Math.max(1, metrics.desktop.loadTime.optimized - target.loadTime)
            },
            pageSize: {
              original: Math.max(1, metrics.desktop.pageSize.original - target.pageSize),
              optimized: Math.max(1, metrics.desktop.pageSize.optimized - target.pageSize)
            }
          },
          mobile: {
            score: 100 - metrics.mobile.score.original,
            loadTime: {
              original: Math.max(1, metrics.mobile.loadTime.original - target.loadTime),
              optimized: Math.max(1, metrics.mobile.loadTime.optimized - target.loadTime)
            },
            pageSize: {
              original: Math.max(1, metrics.mobile.pageSize.original - target.pageSize),
              optimized: Math.max(1, metrics.mobile.pageSize.optimized - target.pageSize)
            }
          }
        }

        // weight: loadTime = 4/5, pageSize = 1/5

        const penaltyScore = {
          desktop: {
            loadTime: (needImprove.desktop.score / 5 * 4) * needImprove.desktop.loadTime.optimized / needImprove.desktop.loadTime.original,
            pageSize: (needImprove.desktop.score / 5) * needImprove.desktop.pageSize.optimized / needImprove.desktop.pageSize.original
          },
          mobile: {
            loadTime: (needImprove.mobile.score / 5 * 4) * needImprove.mobile.loadTime.optimized / needImprove.mobile.loadTime.original,
            pageSize: (needImprove.mobile.score / 5) * needImprove.mobile.pageSize.optimized / needImprove.mobile.pageSize.original
          }
        }

        const optimizedScore = {
          desktop: Math.max(1, Math.min(99, 100 - penaltyScore.desktop.loadTime - penaltyScore.desktop.pageSize)),
          mobile: Math.max(1, Math.min(99, 100 - penaltyScore.mobile.loadTime - penaltyScore.mobile.pageSize)),
        }

        // return res.json({
        //   optimizedScore,
        //   metrics,
        //   needImprove,
        //   penaltyScore
        // })

        res.render('pages/report', {
          report: {
            ...report,
            desktop: {
              ...report.desktop,
              optimizedPerformanceScore: optimizedScore.desktop
            },
            mobile: {
              ...report.mobile,
              optimizedPerformanceScore: optimizedScore.mobile
            }
          }
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
