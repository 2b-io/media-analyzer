import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  desktop: {
    original: mongoose.Schema.Types.Mixed,
    optimized: mongoose.Schema.Types.Mixed,
    originalLighthouseData:  {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    originalPerformanceScore: {
      type: Number,
      default: 0
    },
    optimizePerformanceScore: {
      type: Number,
      default: 0
    }
  },
  mobile: {
    original: mongoose.Schema.Types.Mixed,
    optimized: mongoose.Schema.Types.Mixed,
    originalLighthouseData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    originalPerformanceScore: {
      type: Number,
      default: 0
    },
    optimizePerformanceScore: {
      type: Number,
      default: 0
    }
  },
  images: [ {
    originUrl: String,
    originSize: String,
    optimizeUrl: String,
    optimizeSize: String
  } ],
  progress: [ mongoose.Schema.Types.Mixed ],
  finish: Boolean,
  error: Boolean,
  url: String
}, {
  timestamps: true
})

export default mongoose.model('Report', schema)
