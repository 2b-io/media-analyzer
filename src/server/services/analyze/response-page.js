const responsePage = async (page, resources) => {
  await page.on('response', async (res) => {
    const req = res.request()

    const url = req.url()

    if (url.startsWith('data:')) {
      return
    }

    if (!(url in resources)) {
      resources[url] = { url }
    }

    resources[url].status = res.status()
    resources[url].contentType = (res.headers()['content-type'] || '')
      .split(';').shift()
  })

  return resources
}
export default responsePage
