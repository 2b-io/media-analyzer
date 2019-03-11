const verifySession = async (req, res, next) => {
  if (req.session.loggedIn || req.path === '/login') {
    next()
  } else {
    return  res.redirect('/login')
  }
}

export default verifySession
