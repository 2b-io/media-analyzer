import Email from 'email-templates'
import path from 'path'

import smtp from 'infrastructure/smtp'

import * as typeEmails from './type-emails'

const TYPE_EMAIL = {
  'CUSTOMER_CONTACT': typeEmails.customerContact
}

const emailService = new Email({
  ...smtp,
  views: {
    options: {
      extension: 'ect'
    }
  }
})

const getTemplateDir = (name) => path.join(__dirname, '../../resources/email-templates', name)

export default async (dataEmail) => {
  const typeEmail = TYPE_EMAIL[ dataEmail.type ]

  if (!typeEmail || typeof typeEmail !== 'function') {
    return
  }

  const { template, receivers, locals } = await typeEmail(dataEmail)

  const result = await emailService.send({
    template: getTemplateDir(template),
    message: {
      to: receivers
    },
    locals
  })

  console.log(result)
}
