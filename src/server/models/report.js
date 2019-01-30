import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  origin: [ mongoose.Schema.Types.Mixed ],
  optimize: [ mongoose.Schema.Types.Mixed ],
  images: [ {
    originUrl: String,
    originSize: String,
    optimizeUrl: String,
    optimizeSize: String
  } ],
  progress: [ String ],
  finish: Boolean
}, {
  timestamp: true
})

export default mongoose.model('Report', schema)
