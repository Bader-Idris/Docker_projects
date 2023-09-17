const protect = (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({status: 'fail',message: 'unauthorized'})
  }
  // instead of refering to req.session.user, san likes making it simple as
  req.user = user
  next()
}
module.exports = protect;