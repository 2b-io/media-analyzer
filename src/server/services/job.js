import Job from 'models/job'

import config from 'infrastructure/config'

const list = async (page = 1) => {
  const { pageNumberOfJobs, reportPaginationStep } = config
  const reports = await Job.find().sort('-createdAt').limit(Number(pageNumberOfJobs)).skip(Number(pageNumberOfJobs * (page - 1)))
  const reportsHit = await Job.countDocuments()

  return {
    totalPage: Math.ceil(reportsHit / Number(pageNumberOfJobs)),
    currentPage: page,
    reports,
    reportPaginationStep
  }
}

export default {
  list
}
