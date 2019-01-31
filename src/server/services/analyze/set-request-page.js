import config from 'infrastructure/config'

const setRequestPage = async (page, imgTags) => {
  await page.setRequestInterception(true)

  page.on('request', (interceptedRequest) => {

    if (interceptedRequest.resourceType() === 'image') {
      const url = interceptedRequest.url()

      const imgTag = imgTags[ url ]
      if (imgTag) {
        const { displayed, natural } = imgTag
        interceptedRequest.continue({
          url: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }&w=${ displayed.width }&h=${  displayed.height }`
        })
      } else {
        // css background-image
        interceptedRequest.continue({
          url: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
        })
      }

      return
    }

    // Don't override other requests
    interceptedRequest.continue()
  })

  return page
}

export default setRequestPage
