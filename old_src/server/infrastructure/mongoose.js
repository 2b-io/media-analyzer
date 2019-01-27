import mongoose from 'mongoose'
import config from 'infrastructure/config'

console.log(config.mongodb)

mongoose.Promise = Promise
mongoose.connect(config.mongodb, {
  promiseLibrary: Promise
}, (error) => {
  if (error) { console.log(error) }
})

export default mongoose
