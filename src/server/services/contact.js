import hash from '@emotion/hash'
import ContactModel from 'models/contact'

const update = async (data) => {
  const contact = await ContactModel.findOneAndUpdate({
    identifier: hash(data.email)
  }, data, {
    upsert: true,
    new: true
  }).lean()

  return contact
}
export default {
  update
}
