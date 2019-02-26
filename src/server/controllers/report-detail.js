import bodyParser from 'body-parser'

import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'

import serializeError from 'serialize-error'

import reportDetailService from 'services/report-detail'
import reportService from 'services/report'

export default {
  get: [
    async (req, res, next) => {
      try {
        const { identifier } = req.params

        const { finish, error } = await reportService.get(identifier)

        if (!finish || error) {
          return res.redirect('/')
        }

        const desktopOriginalHar = await reportDetailService(identifier, 'desktop-original')
        const desktopOptimizedHar = await reportDetailService(identifier, 'desktop-optimized')
        const mobileOriginalHar = await reportDetailService(identifier, 'mobile-original')
        const mobileOptimizedHar = await reportDetailService(identifier, 'mobile-optimized')

        const desktopHar = Object.values(desktopOriginalHar).map(({ url }) => {
          return {
            desktopOriginal: {
              ...desktopOriginalHar[ url ]
            },
            desktopOptimized: {
              ...desktopOptimizedHar[ url ]
            }
          }
        })

        const mobileHar = Object.values(mobileOriginalHar).map(({ url }) => {
          return {
            mobileOriginal: {
              ...mobileOriginalHar[ url ]
            },
            mobileOptimized: {
              ...mobileOptimizedHar[ url ]
            }
          }
        })

        res.render('pages/report-detail', {
          report: {
            finish,
            error,
            desktopHar,
            mobileHar
          }
        })
      } catch (e) {
        console.error(e)

        return res.redirect('/')
      }
    }
  ]
}
