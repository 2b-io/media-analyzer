import Parallax from 'parallax-js'

window.addEventListener('load', () => {
  const cloudyBackground = document.getElementById('cloudy')
  const scene = new Parallax(cloudyBackground, {
    limitY: 0
  })

  if (typeof REPORT !== 'undefined') {
    if (!REPORT.finish) {
      cloudyBackground.classList.add('animated')
    }
  }
})
