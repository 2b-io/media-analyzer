import hash from '@emotion/hash'

import ContactModel from 'models/contact'

const create = async ({ email, name, phone, company, content, urlAnalyze }) => {
  const contact = await new ContactModel({
    email,
    name,
    phone,
    company,
    content,
    urlAnalyze
  }).save()

  return contact
}
export default {
  create
}
