import ReportModel from 'models/report'
import { getSocketServer } from 'socket-server'

const create = async (identifier, url) => {
  return await new ReportModel({
    identifier,
    url
  }).save()
}

const get = async (identifier) => {
  return await ReportModel.findOne({
    identifier
  })
}

const update = async (identifier, data) => {
  return await ReportModel.findOneAndUpdate({
    identifier
  }, data)
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

  socketServer.to(identifier).emit('analyze:progress', {
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
  update,
  updateReportOriginPage,
  updateReportOptimizePage,
  updateProgress
}
