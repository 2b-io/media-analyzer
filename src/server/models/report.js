import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  progress: {
    type: Number,
    default: 0
  },
  finish: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    required: true
  },
  optimize: {
    type: Boolean
  },
  data: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
})

export default mongoose.model('Report', schema)
