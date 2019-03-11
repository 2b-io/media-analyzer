import jwt from 'jsonwebtoken'
import ms from 'ms'

import accountService from 'services/account'
import config from 'infrastructure/config'

const verify = async ({ email, password }) => {
  const account = await accountService.findByEmail(email)

  if (!account) {
    throw new Error('Invalid email')
  }

  return account.comparePassword(password) ? account : null
}

export default {
  verify
}
