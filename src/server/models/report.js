import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  original: mongoose.Schema.Types.Mixed,
  optimized: mongoose.Schema.Types.Mixed,
  images: [ {
    originUrl: String,
    originSize: String,
    optimizeUrl: String,
    optimizeSize: String
  } ],
  progress: [ String ],
  finish: Boolean,
  url: String
}, {
  timestamps: true
})

export default mongoose.model('Report', schema)
