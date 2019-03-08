import path from 'path'

const rootDir = path.join(__dirname, '..')

export default {
  // dir
  _root: rootDir,
  screenshotDir: path.join(rootDir, '../../data/screenshot'),
  harDir: path.join(rootDir, '../../data/har'),
  imgDir: path.join(rootDir, '../../assets/img'),
  // env
  devMode: process.env.PORT !== 'production',
  port: process.env.PORT,
  mongodb: process.env.MONGODB,
  assetEndpoint: process.env.ASSET_ENDPOINT,
  optimizerEndpoint: process.env.OPTIMIZER_ENDPOINT,
  optimizerTimeout: process.env.OPTIMIZER_TIMEOUT,
  // google page speed
  googlePageSpeedApiKey: process.env.GOOGLE_PAGE_SPEED_API_KEY,
  googlePageSpeedUrl: process.env.GOOGLE_PAGE_SPEED_URL,
  // google recaptcha
  googleRecaptchaSecretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
  googleRecaptchaSiteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
  googleRecaptchaUrl: process.env.GOOGLE_RECAPTCHA_URL,
  // google analytics
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,

  sendgrid: {
    sender: process.env.SENDGRID_SENDER,
    apiKey: process.env.SENDGRID_API_KEY
  },

  emailReceivers: process.env.EMAIL_RECEIVERS,
  emailAdmin: process.env.EMAIL_ADMIN,
  passwordAdmin: process.env.PASSWORD_ADMIN,

  session: {
    secret: process.env.SESSION_SECRET,
    ttl: process.env.SESSION_TTL
  },
  pageNumberOfReports: process.env.PAGE_NUMBER_OF_REPORTS,
  reportPaginationStep: process.env.REPORT_PAGINATION_STEP
}
