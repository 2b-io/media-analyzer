import config from 'infrastructure/config'

export default async (dataEmail) => {
  const { email, name, content, company, phone, createdAt } = dataEmail

  return {
    template: 'customer-contact',
    to: config.sendgrid.sender,
    receivers: config.emailReceivers,
    locals: {
      email,
      name,
      content,
      company,
      phone,
      createdAt
    }
  }
}
