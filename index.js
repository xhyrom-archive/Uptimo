const db = require("quick.db")
const express = require("express")
const app = express()
const first = db.get("first")
if(!first || first !== "complete") {
  db.push("urls","https://uptime.hyrousek.tk")
  db.set("first","complete")
}
require("./ping.js")

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

/* REDIRECT HTTP to HTTPS */
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http')
    return res.redirect(301, `https://${req.headers.host}/${req.url}`)

  next();
});

/* RENDER INDEX */
app.get("/", async(req, res) => {
  var i = db.get("urls")
  res.render("index", {
    has: i.length
  })
})

app.get("/admin", async(req, res) => {
  var i = db.get("urls")
  res.render("admin", {
    has: i.length
  })
})

/* LOGIN */
app.post("/login", async(req, res) => {
  var i = db.get("urls")
  var name = req.body.name
  var pass = req.body.pass

  if(name !== process.env.name) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check username. Username is bad"
  }) 

  if(pass !== process.env.pass) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check password. Password is bad"
  }) 

  res.render("dashboard", {
    has: i.length,
    urls: i,
    key: pass
  })
})

/* CREATE */
app.post("/create", async(req, res) => {
  var url = req.body.ur
  var u = db.get("urls")

  function isValidUrl(string) {
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }

    return true;
  }

  if(isValidUrl(url) !== true) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check url. Url is not valid"
  }) 

  if (u.indexOf(url) > -1) {
    return res.render("error", {
        error: true,
        status: 400,
        error: "Please check url. Url is already on db"
      }) 
  }

  db.push("urls",url)
  res.render("error", {
    error: true,
    status: 200,
    error: "URL is succesfully added! ("+url+")"
  })
})

app.post("/remove", async(req, res) => {
  var u = db.get("urls")
  var url = req.body.ur
  var key = req.body.key

  if(!url) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define url."
  }) 

  if(key !== process.env.pass) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check key. Key is bad"
  }) 

  if (u.indexOf(url) > -1) {
    var array = db.get("urls");
    array = array.filter(v => v !== url);
    db.set("urls", array)

    res.render("error", {
        error: false,
        status: 200,
        error: "URL is deleted! (" + url + ")"
    }) 
  return;
  }

  return res.render("error", {
      error: true,
      status: 400,
      error: "Please check url. Url is not on db"
    }) 
})

app.listen(process.env.port || 5000, () => {
  console.log("Website started")
})
