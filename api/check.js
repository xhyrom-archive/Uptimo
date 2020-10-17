module.exports = async(app, db) => {
  app.get("/api/check", async(req, res) => {
    if(!req.query.url) return res.json({
      status: 400,
      error: "Please define url"
    })

    var url = req.query.url
    var u = db.get("urls")

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
      var status = db.get(`status_${url}`)
      var check = {
        true: "online",
        false: "offline",
        undefined: "Please wait to check (1 minute)"
      }
      var status_text = db.get(`status_${url}`).statustext
      var status_code = db.get(`status_${url}`).statuscode

      return res.json({
        "url": url,
        "status": check[status.status],
        "status_code": status_code,
        "status_text": status_text
      })
    }

    return res.json({
      status: 400,
      error: "Please check url. Url is not on db"
    }) 
  })
}
