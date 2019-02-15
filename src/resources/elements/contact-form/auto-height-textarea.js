window.addEventListener('load', () => {
  const textAreas = document.querySelectorAll('.input-line.multi-line')

  Array.from(textAreas).forEach((textArea) => {
    const resize = () => {
      textArea.style.height = 0 //'auto'
      textArea.style.height = `${ textArea.scrollHeight }px`
    }

    textArea.addEventListener('input', resize, false)

    resize()
  })
})
