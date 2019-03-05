import bcrypt from 'bcrypt'
import randomInt from 'random-int'
import sh from 'shorthash'

import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
})
schema.index({ email: 'text' })

schema.pre('save', function (next) {
  if (!this.identifier) {
this.identifier = sh.unique(String(this._id))
  }

  next()
})

schema.methods = {
  comparePassword(plain) {
    return bcrypt.compareSync(plain, this.hashedPassword)
  },
}

schema.virtual('password').set(function(password) {
  this.hashedPassword = hashPassword(password)
})

export const hashPassword = (plainPassword) => {
  const salt = randomInt(8, 12)
  return bcrypt.hashSync(plainPassword, salt)
}

export default mongoose.model('Account', schema)
