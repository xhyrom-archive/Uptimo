const db = require("quick.db")
const express = require("express")
const app = express()
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

/* CREATE */
app.post("/create", async(req, res) => {
  var url = req.body.ur
  var u = db.get("urls")

  if (u.indexOf(url) > -1) {
    return res.json({
      status: 400,
      error:"URL_IN_DB"
    })
  }

  db.push("urls",url)
  res.json({
    status: 200,
    message: "URL is added! (" + url + ")"
  })
})

app.listen(process.env.port || 5000, () => {
  console.log("Website started")
})
