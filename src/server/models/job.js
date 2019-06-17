import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: Number,
    default: 0
  },
  data: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
})

export default mongoose.model('Job', schema)
