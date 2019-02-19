import PuppeteerHar from 'puppeteer-har'

const generateHar = async (page, harName) => {
  const har = new PuppeteerHar(page)

  await har.start({ path: harName })

  await har.stop()
}

export default generateHar
