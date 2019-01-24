import Report from 'models/Report'

export default {
  get: async (tag) =>  await Report.findOne({ tag }).lean(),
  set: async (tag, values) => await Report.findOneAndUpdate(
    { tag },
    { tag, values },
    { upsert: true }
  )
}
