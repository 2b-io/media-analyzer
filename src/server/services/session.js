import jwt from 'jsonwebtoken'
import ms from 'ms'

import accountService from 'services/account'
import config from 'infrastructure/config'

const create = async ({ email, password }) => {
  const account = await accountService.findByEmail(email)

  if (!account) {
    throw new Error('Invalid email')
  }

  return account.comparePassword(password) ? issueJWT(account) : null
}

const verify = async (token, { refresh } = { refresh: false }) => {
  const decoded = jwt.verify(token, config.session.secret)

  const account = await accountService.findById(decoded._id)

  if (!account) {
    throw new Error('Invalid or expired JWT')
  }

  return refresh ? issueJWT(account) : {
    token,
    ttl: ms(config.session.ttl),
    account
  }
}

const issueJWT = (account) => {
  const payload = {
    _id: account._id
  }

  const token = jwt.sign(payload, config.session.secret, {
    expiresIn: config.session.ttl
  })

  return {
    token,
    ttl: ms(config.session.ttl),
    account
  }
}

export default {
  create
}
