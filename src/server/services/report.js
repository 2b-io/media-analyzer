import reportModel from 'models/report'

const createOrUpdate = async (identifier, data) => {
  return await reportModel.findOneAndUpdate(
    { identifier },
    data,
    { upsert: true, new: true }
  ).lean()
}

const get = async (identifier) => {
  return await reportModel.findOne({
    identifier
  })
}

export default {
  createOrUpdate,
  get
}
