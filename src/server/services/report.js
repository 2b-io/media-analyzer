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



const updateReportOriginPage = async (identifier, data) => {
  const report = await ReportModel.findOneAndUpdate({
    identifier
  }, {
    $push: {
      origin: data
    }
  }, {
    new: true
  }).lean()

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
    new: true
  }).lean()

  return report
}

export default {
  create,
  get,
  updateReportOriginPage,
  updateReportOptimizePage,
  updateProgress
}
