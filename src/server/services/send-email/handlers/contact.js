import config from 'infrastructure/config'

export default async (payload) => {
  const { link, customerName, customerEmail, message } = payload

  return {
    template: 'contact',
    to: config.sendgrid.sender,
    receivers: customerEmail,
    locals: {
      customerName,
      message,
      link
    }
  }
}
