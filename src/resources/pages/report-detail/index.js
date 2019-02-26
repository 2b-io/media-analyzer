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

window.addEventListener('load', () => {
  handleTabs()
})
