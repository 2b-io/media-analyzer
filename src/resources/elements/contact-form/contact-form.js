import request from 'superagent'

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
