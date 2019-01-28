import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  values: {
    type: Object,
    required: true
  }
}, {
  timestamp: true
})

export default mongoose.model('Report', schema)
