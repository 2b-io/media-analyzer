import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

import config from 'infrastructure/config'

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

const list = async (params = {}, page, query) => {

  const { pageNumberOfReports, reportPaginationStep } = config

  const reports = await ReportModel.find(params).sort('-createdAt').limit(Number(pageNumberOfReports)).skip(Number(Math.abs(pageNumberOfReports * (page - 1))))

  const reportsHit = await ReportModel.find(params).countDocuments()

  return {
    totalPage: Math.ceil(reportsHit / Number(pageNumberOfReports)),
    currentPage: page,
    reports,
    reportPaginationStep,
    reportsHit,
    query
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
