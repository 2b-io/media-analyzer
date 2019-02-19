import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  desktopOriginalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  desktopOptimizedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mobileOriginalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mobileOptimizedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  desktopLighthouseData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  desktopOriginalScore: {
    type: Number,
    default: 0
  },
  mobileLighthouseData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mobileOriginalScore: {
    type: Number,
    default: 0
  },
  images: [ {
    originUrl: String,
    originSize: String,
    optimizeUrl: String,
    optimizeSize: String
  } ],
  progress: [ mongoose.Schema.Types.Mixed ],
  finish: Boolean,
  error: {
    type: Boolean,
    default: false
  },
  url: String
}, {
  timestamps: true
})

export default mongoose.model('Report', schema)
