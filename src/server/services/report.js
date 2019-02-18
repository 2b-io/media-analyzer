import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

const STEPS = {
  'Load origin desktop page...': 1,
  'Load origin desktop page... done': 2,
  'Warm up cache...': 3,
  'Warm up cache... done': 4,
  'Load optimized desktop page...': 5,
  'Load optimized desktop page... done': 6,
  'Load origin mobile page...': 7,
  'Load origin mobile page... done': 8,
  'Load optimized mobile page...': 9,
  'Load optimized mobile page... done': 10,
  'Google page speed test desktop mode...': 11,
  'Google page speed test desktop... done': 12,
  'Google page speed test mobile mode...': 13,
  'Google page speed test mobile... done': 14,
  'Finished!': 15
}

const TOTAL_STEPS = Object.keys(STEPS).length

const create = async (identifier, url) => {
  return await new ReportModel({
    identifier,
    url
  }).save()
}

const get = async (identifier) => {
  return await ReportModel.findOne({
    identifier
  }).lean()
}

const list = async (...args) => {
  return await ReportModel.find(...args).sort('-createdAt')
}

const update = async (identifier, data) => {
  return await ReportModel.findOneAndUpdate({
    identifier
  }, data)
}

const updateProgress = async (identifier, message) => {
  const messageContent = {
    step: STEPS[ message ],
    total: TOTAL_STEPS,
    message
  }

  const report = await ReportModel.findOneAndUpdate({
    identifier
  }, {
    $push: {
      progress: messageContent
    }
  }, {
    upsert: true,
    new: true
  }).lean()

  const socketServer = getSocketServer()

  socketServer.to(identifier).emit('analyze:progress', {
    payload: {
      message: messageContent
    }
  })

  return report
}

export default {
  create,
  get,
  list,
  update,
  updateProgress
}
