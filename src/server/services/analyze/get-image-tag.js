import normalizeUrl from 'services/normalize-url'

const imgTags = async (page) => {
  const location = await page.evaluate(() => ({
    hostname: location.hostname,
    protocol: location.protocol
  }))

  const normalize = normalizeUrl(location.protocol, location.hostname)

  return (
    await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')

      return [].slice.call(imgs).map((img) => {
        return {
          natural:{
            width: img.naturalWidth,
            height: img.naturalHeight
          },
          displayed: {
            width: img.clientWidth,
            height: img.clientHeight
          },
          src: img.getAttribute('src')
        }
      })
    })
  )
  .filter(Boolean)
  .filter(img => {
    return img.src && img.natural.width > 0 && img.natural.height > 0 && img.displayed.width > 0 && img.displayed.height > 0
  })
  .map(img => ({
    ...img,
    shouldResize: (img.natural.width * img.natural.height) > (img.displayed.width * img.displayed.height),
    url: normalize(img.src.trim())
  }))
  .reduce((tags, img) => {
    const { url } = img
    const existed = tags[url]

    if (!existed) {
      tags[url] = img
    } else {
      if ((img.displayed.width * img.displayed.height) > (existed.displayed.width * existed.displayed.height)) {
        tags[url] = img
      }
    }

    return tags
  }, {})
}

export default imgTags
