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
  finish: Boolean,
  error: Boolean,
  url: String,
  data: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
})

export default mongoose.model('Report', schema)
