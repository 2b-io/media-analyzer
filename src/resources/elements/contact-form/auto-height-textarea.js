const observe = (element, event, handler) => {
  element.addEventListener(event, handler, false)
}

window.addEventListener('load', () => {
  const textAreas = document.querySelectorAll('.input-line.multi-line')

  Array.from(textAreas).forEach((textArea) => {
    const resize = () => {
      textArea.style.height = 'auto'
      textArea.style.height = `${ textArea.scrollHeight }px`
    }

    const delayedResize = () => {
      setTimeout(resize, 0)
    }

    observe(textArea, 'change', resize)
    observe(textArea, 'cut', delayedResize)
    observe(textArea, 'paste', delayedResize)
    observe(textArea, 'drop', delayedResize)
    observe(textArea, 'keydown', delayedResize)

    // init
    textArea.focus()
    textArea.select()
    resize()
  })
})
