const useHttps = function useHttps(req, res, next) {
  const protoHeader = req.headers["x-forwarded-proto"]
  if (protoHeader && protoHeader !== "https") {
    res.redirect(301, "https://" + process.env.SITE_DOMAIN + req.url)
  } else next()
}
exports.useHttps = useHttps

const useWww = function useWww(req, res, next) {
  const shouldForward = req.hostname === "voip-check.com"
  if (shouldForward) {
    res.redirect(301, "https://" + process.env.SITE_DOMAIN + req.url)
  } else next()
}
exports.useWww = useWww
