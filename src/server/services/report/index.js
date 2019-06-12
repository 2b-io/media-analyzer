import uuid from 'uuid'

import Report from 'models/report'
import ReportModel from 'models/report'

import config from 'infrastructure/config'

import { createWatcher } from './watcher'

const create = async ({ url }) => {
  return new Report({
    identifier: uuid.v4(),
    url
  }).save()
}

const get = async (identifier) => {
  return Report.findOne({ identifier }).lean()
}

const list = async (page = 1) => {
  const { pageNumberOfReports, reportPaginationStep } = config
  const reports = await ReportModel.find().sort('-createdAt').limit(Number(pageNumberOfReports)).skip(Number(pageNumberOfReports * (page - 1)))
  const reportsHit = await ReportModel.countDocuments()

  return {
    totalPage: Math.ceil(reportsHit / Number(pageNumberOfReports)),
    currentPage: page,
    reports,
    reportPaginationStep
  }
}


export default {
  create,
  createWatcher,
  list,
  get
}
