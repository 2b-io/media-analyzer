const receivedData = async (page) => {
  const resources = {}
  await page._client.on('Network.dataReceived', async (event) => {
    const req = page._networkManager._requestIdToRequest.get(event.requestId)

    if (!req) {
      return
    }

    const url = req.url()

    if (url.startsWith('data:')) {
      return
    }

    const length = event.dataLength

    if (!(url in resources)) {
      resources[url] = { url }
    }

    resources[url].size = (resources[url].size || 0) + length
  })

  return resources
}

export default receivedData
