import path from 'path'

const screenshot = async (page, reportTag, progress, screenshotDir, index) => {
  // progress(`Capture screenshot...`)

  const screenshot = `${ reportTag }-${ index }.jpeg`

  await page.screenshot({
    path: path.join(screenshotDir, screenshot),
    fullPage: true,
    type: 'jpeg',
    quality: 100
  })

  return path.join(screenshotDir, screenshot)
}

export default screenshot
