import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

const STEPS = [
  'Load origin desktop page...',
  'Load origin desktop page... done',
  'Warm up cache...',
  'Warm up cache... done',
  'Load optimized desktop page...',
  'Load optimized desktop page... done',
  'Load origin mobile page...',
  'Load origin mobile page... done',
  'Warm up cache...',
  'Warm up cache... done',
  'Load optimized mobile page...',
  'Load optimized mobile page... done',
  'Google page speed test desktop mode...',
  'Google page speed test desktop... done',
  'Google page speed test mobile mode...',
  'Google page speed test mobile... done',
  'Finished!'
]

const TOTAL_STEPS = STEPS.length

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

const list = async (page) => {
  const reports = await ReportModel.find().sort('-createdAt').limit(10).skip(Number(10 * page))
  const reportsHit = await ReportModel.count()

  return {
    reportsHit,
    reports,
  }
}

const update = async (identifier, data) => {
  return await ReportModel.findOneAndUpdate({
    identifier
  }, data)
}

const updateProgress = async (identifier, message) => {
  const { progress, error } = await ReportModel.findOne({ identifier })

  const messageContent = {
    step: progress.length + 1,
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

  if (error) {
    socketServer.to(identifier).emit('analyze:failure', {
      payload: {
        error
      }
    })
  }

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
