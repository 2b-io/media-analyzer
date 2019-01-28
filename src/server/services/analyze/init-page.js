import boolean from 'boolean'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const initPage = async (browser, params) => {
  const resources = {}

  const viewport = {
    width: parseInt(params.w || 1280, 10),
    height: parseInt(params.h || 900, 10),
    isMobile: boolean(params.mobile)
  }

  const ua = boolean(params.mobile) ? MOBILE_UA : DESKTOP_UA

  const page = await browser.newPage()

  // config headless-chrome-page
  await page.setViewport(viewport)
  await page.setUserAgent(ua)

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

  return page
}

export default initPage
