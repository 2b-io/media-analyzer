import request from 'superagent'

const handleLogout = () => {
  document.getElementById('sidebar-item-logout').addEventListener('click', async () => {
    await request.post('/logout')
    window.location.reload()
  })
}

window.addEventListener('load', () => {
  handleLogout()
})
