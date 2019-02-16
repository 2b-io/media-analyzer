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
    event.preventDefault()

    const formData = new FormData(event.target)
    const name = formData.get('name')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const company = formData.get('company')
    const content = formData.get('content')

    const token = await grecaptcha.execute('6LdQp5EUAAAAAIdiADbkjQ2HKpi2HZ8qcKIQ9Tug', {
      action: 'contact'
    })

    const url = window.location.protocol + "//" + window.location.host

    await request.post(`${ url }/contact`)
    .type('form')
    .send({ name, email, phone, company, content, token })
  })
})
