import hash from '@emotion/hash'

import ContactModel from 'models/contact'
import sendEmail from 'services/send-email'

const create = async ({ email, name, phone, company, content }) => {
  const contact = await new ContactModel({
    email,
    name,
    phone,
    company,
    content
  }).save()

  const payload = {
    type: 'CONTACT',
    email:'mr-rocket.io',
    customerEmail: email,
    customerName: name,
    link:'https://app.mr-rocket.io/register'
  }

  await sendEmail(payload)

  return contact
}
export default {
  create
}
