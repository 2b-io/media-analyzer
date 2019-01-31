import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

const create = async (identifier, data = { origin: [], optimzed: [] }) => {
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
    upsert: true,
    new: true
  }).lean()

  const socketServer = getSocketServer()

  socketServer.emit('progress', {
    payload: {
      message
    }
  })

  return report
}

const updateReportOriginPage = async (identifier, data) => {
  const report = await ReportModel.findOneAndUpdate({
    identifier
  }, {
    $push: {
      origins: data
    }
  }, {
    upsert: true,
    new: true
  }).lean()

  const socketServer = getSocketServer()

  socketServer.emit('report origin', {
    payload: {
      message: data
    }
  })

  return report
}

const updateReportOptimizePage = async (identifier, data) => {
  const report = await ReportModel.findOneAndUpdate({
    identifier
  }, {
    $push: {
      optimize: data
    }
  }, {
    upsert: true,
    new: true
  }).lean()

  const socketServer = getSocketServer()

  socketServer.emit('report optimize', {
    payload: {
      message: data
    }
  })

  return report
}

export default {
  create,
  get,
  updateReportOriginPage,
  updateReportOptimizePage,
  updateProgress
}
