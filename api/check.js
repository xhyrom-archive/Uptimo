const path = require("path")
module.exports = async(app, db) => {
  app.get("/api/check", async(req, res) => {
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

      var status = await db.get(`status_${url}`)
      if(status === undefined || !status) {
        return res.json({
          "url": url,
          "status": "⏲️ Please wait 1m to check!",
          "status_code": "400",
          "status_text": "WAIT_1M"
        })
      }

      var check = {
        true: "online",
        false: "offline",
        undefined: "Please wait to check (1 minute)"
      }

      if(req.query.badge) {

        res.setHeader('Content-Type', 'image/svg+xml');
        if(status.statuscode === 200) {
          return res.sendFile(path.resolve('./badge/upstatus.svg'));
        } else {
          return res.sendFile(path.resolve('./badge/downstatus.svg'));
        }
      }

      return res.json({
        "url": url,
        "status": check[status.status],
        "status_code": status.statuscode,
        "status_text": status.statustext
      })
    }

    return res.json({
      status: 400,
      error: "Please check url. Url is not on db"
    }) 
  })
}
