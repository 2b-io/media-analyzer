import boolean from 'boolean'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const initPage = async (browser, params) => {
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

  return page
}

export default initPage
