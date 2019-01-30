import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

const createOrUpdate = async (identifier, data) => {
  return await ReportModel.findOneAndUpdate({
    identifier
  }, data, {
    upsert: true,
    new: true
  }).lean()
}

const get = async (identifier) => {
  return await ReportModel.findOne({
    identifier
  })
}

const updateProgress = async (identifier, message) => {
  const report = await ReportModel.findOneAndUpdate({
    identifier
  }, {
    $push: {
      progress: message
    }
  }, {
    new: true
  }).lean()

  const socketServer = getSocketServer()

  socketServer.to(identifier).emit('progress', {
    payload: {
      message
    }
  })

  return report
}

export default {
  createOrUpdate,
  get
}
