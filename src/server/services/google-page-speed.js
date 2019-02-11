import request from 'superagent'

import config from 'infrastructure/config'

const googlePageSeed = async (url) => {
  const response = await request.get(config.googlePageSpeedUrl)
    .query({ key: config.googlePageSpeedApiKey, url })

  return response.body
}

export default googlePageSeed
