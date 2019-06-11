import { auditStructData } from './struct-data'
import descriptionDefine from './description-define'

 const formatDataLighthouse = (originalLighthouseData) => {
  const auditsData = Object.keys(originalLighthouseData.audits).map((element) => {
    if (auditStructData.indexOf(element) !== -1) {
      let key = element.replace(/-([ a-z ])/g, (g) => g[ 1 ].toUpperCase())
      let value = originalLighthouseData.audits[ element ]
      value.descriptionDefine = descriptionDefine[ element ].description

      return { [ key ]: value }
    }

    return
  })
  .filter(Boolean)
  .reduce((arr, element) => {
    let key = Object.keys(element)[ 0 ]
    let value = Object.values(element)[ 0 ]
    return { ...arr, [ key ]: value }
  }, {} )

  let {
    userAgent,
    fetchTime,
    requestedUrl,
    finalUrl,
    categories
  } = originalLighthouseData

  return {
    userAgent,
    fetchTime,
    requestedUrl,
    finalUrl,
    categories,
    audits: auditsData
  }
}

export default formatDataLighthouse
