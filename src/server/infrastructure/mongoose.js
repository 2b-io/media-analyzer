import mongoose from 'mongoose'

import config from 'infrastructure/config'

mongoose.connect(config.mongodb, {
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useCreateIndex: true
}, (error) => {
  if (error) {
    console.error(error)
  }
})

export default mongoose
