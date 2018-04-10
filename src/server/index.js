import puppeteer from 'puppeteer'

const main = async () => {
  const browser = await puppeteer.launch({
    // headless: f,
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
  })

  // console.log(browser)

  // await browser.close()

  const url = 'https://www.york.ac.uk/teaching/cws/wws/webpage1.html'
  // const url = 'http://duongtrongtan.com'
  // const url = 'https://stuffs.cool'
  // const
  const resources = {}

  try {
    console.log('new page...')

    const page = await browser.newPage()

    console.log('new page... done')

    console.log(`go to... ${url}`)

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

      console.log('Network.dataReceived', url, length)

      resources[url] = (resources[url] || 0) + length
    })

    await page.on('requestfinished', async (req) => {
      // const res = req.response()
      // const headers = res.headers()

      // console.log('requestfinished', req.url(), headers['content-length'])

      // const request = response.request()


      // console.log('request', request.url())
      // console.log('headers', headers)
    })

    console.time('Load webpage')

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 3000000
    })

    console.log(resources)

    console.timeEnd('Load webpage')

    console.log(`go to ${url}... done`)

    console.log('capture...')

    await page.screenshot({
      path: 'screenshot.jpeg',
      fullPage: true
    })

    console.log('capture... done')
  } finally {
    await browser.close()
  }

  console.log('done')
}

main()
