import request from 'superagent'

import config from 'infrastructure/config'

export default async (url, params) => {
  const response = await request.get(config.googlePageSpeedUrl)
    .query({
      key: config.googlePageSpeedApiKey,
      url,
      ...params
    })

  return response.body
}
