import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  email: String,
  name: String,
  phone: Number,
  content: String,
  company: String
}, {
  timestamps: true
})

export default mongoose.model('Contact', schema)
