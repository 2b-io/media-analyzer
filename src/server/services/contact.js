import date from 'date-and-time'
import hash from '@emotion/hash'

import ContactModel from 'models/contact'

import sendEmail from 'services/send-email'

const create = async ({ email, name, phone, company, content, urlAnalyze }) => {
  const contact = await new ContactModel({
    email,
    name,
    phone,
    company,
    content,
    urlAnalyze
  }).save()

  if (contact) {
    await sendEmail({
      email,
      name,
      phone,
      company,
      content,
      createdAt: date.format(new Date(), 'DD/MM/YYYY - HH:mm:ss'),
      type: 'CUSTOMER_CONTACT'
      }
    )
  }

  return contact
}
export default {
  create
}
