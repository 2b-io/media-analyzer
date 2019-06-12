import mongoose from 'mongoose'

import config from 'infrastructure/config'

mongoose.connect(config.mongodb, {
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}, (error) => {
  if (error) {
    console.error(error)
  }
})

export default mongoose
