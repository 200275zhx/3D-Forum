function requireAuthenticatedMiddleware(request, response, next) {
  console.log('requireAuthenticated middleware for: ', request.path)
  if (request.session.loggedInUser) {
    next()
  } else {
    response.redirect('/login?error=true')
  }
}

function requireNotAuthenticatedMiddleware(request, response, next) {
  if (request.session.loggedInUser) {
    response.redirect('/')
  } else {
    next()
  }
}

module.exports = {
  requireAuthenticated: requireAuthenticatedMiddleware,
  requireNotAuthenticated: requireNotAuthenticatedMiddleware
}