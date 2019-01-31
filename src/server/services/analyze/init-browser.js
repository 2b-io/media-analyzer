import puppeteer from 'puppeteer'

const initBrowser = async () => {
  const browser = await puppeteer.launch({
    // headless: f,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ],
    ignoreHTTPSErrors: true
  })

  return browser
}

export default initBrowser
