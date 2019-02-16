import request from 'superagent'

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

grecaptcha.ready(() => {
  const form = document.getElementById('formContact')

  form.addEventListener('submit', async (event) => {
    try {
      event.preventDefault()

      const formData = new FormData(event.target)
      const name = formData.get('name')
      const email = formData.get('email')
      const phone = formData.get('phone')
      const company = formData.get('company')
      const content = formData.get('content')

      const token = await grecaptcha.execute(RECAPTCHA_KEY, {
        action: 'contact'
      })

      await request.post('/contact')
        .type('form')
        .send({
          name,
          email,
          phone,
          company,
          content,
          token
        })
    } catch (e) {
      console.log('error', e)
    } finally {
      event.target.reset()
    }
  })
})
