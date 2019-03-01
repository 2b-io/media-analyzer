import 'elements/contact-form/auto-height-textarea'

const handleTabs = () => {
    document.getElementById('tab-mobile').addEventListener('click', () => {
    document.getElementById('report-detail-mobile').className = 'report-detail report-detail-show'
    document.getElementById('report-detail-desktop').className = 'report-detail report-detail-hidden'
    document.getElementById('tab-mobile').className = 'elements-tab-active'
    document.getElementById('tab-desktop').className = 'elements-tab'
  })

  document.getElementById('tab-desktop').addEventListener('click', () => {
    document.getElementById('report-detail-desktop').className = 'report-detail report-detail-show'
    document.getElementById('report-detail-mobile').className = 'report-detail report-detail-hidden'
    document.getElementById('tab-desktop').className = 'elements-tab-active'
    document.getElementById('tab-mobile').className = 'elements-tab'
  })
}

const handleViewFileName = () => {
  let listFile = document.getElementsByClassName('file-name')

  const displayFullName = (element, originName) => {
    element.getElementsByTagName('a')[0].innerText = originName
  }

  const displayShortName = (element, newName) => {
    element.getElementsByTagName('a')[0].innerText = newName
  }

  Array.from(listFile).forEach((element) => {
    const originName = element.getElementsByTagName('a')[0].innerText.trim()

    if (originName.length > 40) {
      const lastPart = originName.substring(originName.length - 10, originName.length)
      const firstPart = originName.substring(0, 20)
      const newName = `${ firstPart }...${ lastPart }`
      element.getElementsByTagName('a')[0].innerText = newName

      element.addEventListener('mouseenter', () => {
        displayFullName(element, originName)
      })

      element.addEventListener('mouseleave', () => {
        displayShortName(element, newName)
      })
    }
  })
}

window.addEventListener('load', () => {
  handleTabs(),
  handleViewFileName()
})
