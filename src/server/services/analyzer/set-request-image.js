import config from 'infrastructure/config'
import adBlocker from 'services/adblock'

const setRequestImage = (page, images) => {
  page.on('request', async (request) => {
    const url = request.url()

    if (request.resourceType() === 'image') {
      // check ads
      if (adBlocker.isAdvertisement(url)) {
        // don't optimize advertisement media
        console.log(`[adblock] skip ${ url }`)
        return request.continue()
      }

      if (images[url] && images[url].optimizedUrl) {
        return request.continue({
          url: images[url].optimizedUrl
        })
      }

      return request.continue({
        optimizedUrl: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
      })
    }

    request.continue()
  })
}

export default setRequestImage
