import Parallax from 'parallax-js'

const main = () => {
  const cloudyBackground = document.getElementById('cloudy')
  const scene = new Parallax(cloudyBackground, {
    limitY: 0
  })

  if (typeof REPORT !== 'undefined') {
    if (!REPORT.finish) {
      cloudyBackground.classList.add('animated')
    }
  }
}

main()
