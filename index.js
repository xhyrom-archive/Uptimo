const db = require("quick.db")
const bcrypt = require('bcrypt')
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

/* LOGIN */
app.post("/register", async(req, res) => {
  var i = db.get("urls")
  var name = req.body.name
  var pass = req.body.pass
  var acc = db.get(`account_${name}`)

  if(acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account already exists!"
  }) 

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(pass, salt)

  db.set(`account_${name}`, {
    pass: hash,
    name: name,
    ban: false
  })

  if(!acc) return res.render("error", {
    error: false,
    status: 200,
    error: "Account succesfully created!"
  })
})

/* LOGIN */
app.post("/login", async(req, res) => {
  var i = db.get("urls")
  var u = db.all().filter(data => data.ID.startsWith(`account`)).sort((a, b) => b.data - a.data)

  var ir = 0;
  var g = "";
  for (ir in u) {
    g += `${u[ir].ID.split('_')[1]} <a style="background: transparent;" href="/b?pass=${req.body.pass}&user=${u[ir].ID.split('_')[1]}&type=ban">BAN</a> | <a style="background: transparent;" href="/b?pass=${req.body.pass}&user=${u[ir].ID.split('_')[1]}&type=delete">DELETE</a><br>`;
  }

  var ur = ""
  i.forEach(function(url) {
    ur += `${url} <a style="background: transparent;" href="/r?pass=${req.body.pass}&url=${url}">DELETE</a><br>`
  })

  var name = req.body.name
  var pass = req.body.pass
  var acc = db.get(`account_${name}`)


  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exists"
  }) 

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(pass, salt)

  const match = await bcrypt.compare(pass, acc.pass);

  if(!match) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check password. Password is bad"
  })

  if(acc.ban) return res.render("error", {
    error: true,
    status: 400,
    error: "Your account disabled :("
  })

  var perms;
  if(acc.name === process.env.adminname) {
    perms = true
  } else {
    perms = false
  }

  res.render("dashboard", {
    perms: perms,
    urls: ur,
    has: i.length,
    members: g
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

  if(isValidUrl(url) !== true || url.includes("<" || ">" || "<script>" || "</script>") || encodeURIComponent(url).includes("%3C" || "%3E" || "%20")) return res.render("error", {
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

/* BAN USER & REMOVE URL */
app.get("/b", async(req, res) => {
  const acc = db.get(`account_${process.env.adminname}`)

  if(!req.query.pass) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define password."
  })

  const match = await bcrypt.compare(req.query.pass, acc.pass);
  if(!match) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check password. Password is bad"
  })

  if(!req.query.user) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define user."
  })

  var del = db.get(`account_${req.query.user}`)
  if(!del) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check user. User is bad"
  })


  if(req.query.type === "ban") {
    var old = db.get(`account_${req.query.user}`)
    db.set(`account_${req.query.user}`, {
      pass: old.pass,
      name: old.name,
      ban: true
    })

    return res.render("error", {
        error: false,
        status: 200,
        error: "User succesfully banned!"
    })
  }

  if(req.query.type === "delete") {
    db.delete(`account_${req.query.user}`)

    return res.render("error", {
        error: false,
        status: 200,
        error: "User succesfully deleted!"
    })
  }
})

app.get("/r", async(req, res) => {
  const acc = db.get(`account_${process.env.adminname}`)
  const u = db.get("urls")

  if(!req.query.pass) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define password."
  })
  const match = await bcrypt.compare(req.query.pass, acc.pass);
  if(!match) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check password. Password is bad"
  })

  if(!req.query.url) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define url."
  })

  if (u.indexOf(req.query.url) > -1) {
    var array = db.get("urls");
    array = array.filter(v => v !== req.query.url);
    db.set("urls", array)

    res.render("error", {
        error: false,
        status: 200,
        error: "URL is deleted! (" + req.query.url + ")"
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
