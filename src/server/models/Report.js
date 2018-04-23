import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true
  },
  values: {
    type: Object,
    required: true
  }
})

export default mongoose.model('Report', schema)
