import config from 'infrastructure/config'

export default {
  send: !config.isDevMode,
  message: {
    from: config.sendgrid.sender
  },
  transport: {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: config.sendgrid.apiKey
    }
  }
}
