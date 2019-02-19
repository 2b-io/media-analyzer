import PuppeteerHar from 'puppeteer-har'

const generateHar = async (page, harName) => {
  const har = new PuppeteerHar(page)
  console.log('harName', harName)
  await har.start({ path: harName })

  await har.stop()
}

export default generateHar
