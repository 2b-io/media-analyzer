import uuid from 'uuid'

import Report from 'models/report'

import { createWatcher } from './watcher'

const create = async ({ url, optimize }) => {
  return new Report({
    identifier: uuid.v4(),
    url,
    optimize
  }).save()
}

const get = async (identifier) => {
  return Report.findOne({ identifier }).lean()
}

export default {
  create,
  createWatcher,
  get
}
