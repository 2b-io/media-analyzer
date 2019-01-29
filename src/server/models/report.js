import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  origin: [ String ],
  optimize: [ String ],
  images: [ {
    originUrl: String,
    originSize: String,
    optimizeUrl: String,
    optimizeSize: String
  } ],
}, {
  timestamp: true
})

export default mongoose.model('Report', schema)
