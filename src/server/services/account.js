import Account from 'models/account'

const create = async (info) => {
  const { email, password } = info

  return await new Account({
    email,
    password
  }).save()
}

const list = async () => {
  return await Account.find().lean().exec()
}

const findByEmail = async (email) => {
  return await Account.findOne({ email })
}

const findById = async (id) => {
  return await Account.findById(id).lean()
}

export default {
  create,
  findByEmail,
  findById,
  list
}
