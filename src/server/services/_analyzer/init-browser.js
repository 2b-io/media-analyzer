import puppeteer from 'puppeteer'

const initBrowser = async (params) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--enable-features=NetworkService'
    ],
    ignoreHTTPSErrors: true
  })

  return browser
}

export default initBrowser
