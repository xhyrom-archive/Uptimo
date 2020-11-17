const rateLimit = require("express-rate-limit");
const { rateLimitmax , rateLimitmessage } = require("../config.json")

const addedUrlLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: rateLimitmax,
  message: rateLimitmessage
});

module.exports = async(app, db) => {
  app.get("/api/create", addedUrlLimit, async(req, res) => {
    if(!req.query.url) return res.json({
      status: 400,
      error: "Please define url"
    })

    var url = req.query.url
    var u = await db.get("urls")

    function isValidUrl(string) {
      try {
        new URL(string);
      } catch (_) {
        return false;  
      }

      return true;
    }

    if(isValidUrl(url) !== true || url.includes("<" || ">" || "<script>" || "</script>") || encodeURIComponent(url).includes("%3C" || "%3E" || "%20")) return res.json({
      status: 400,
      error: "Please check url. Url is not valid"
    })

    var ui = [];
    var ur = ""
    u.forEach(function(url) {
      var ugall = url.split("<")[0]
      ui.push(ugall)
    })

    if (ui.indexOf(url) > -1) {
      return res.json({
          status: 400,
          error: "Please check url. Url is already on db"
      })
    }

    db.push("urls",url)
    return res.json({
        status: 200,
        message: "URL is succesfully added! ("+url+")"
    })
  })
}