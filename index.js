const db = require("quick.db")
const rateLimit = require("express-rate-limit");
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const fs = require("fs")

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
app.use(cookieParser());

/* REDIRECT HTTP to HTTPS */
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http')
    return res.redirect(301, `https://${req.headers.host}/${req.url}`)

  next();
});

/* API RUN */
fs.readdirSync(__dirname + '/api').forEach(f => require(`./api/${f}`)(app, db));

/* RENDER INDEX */
app.get("/", async(req, res) => {
  var c = req.cookies.login
  if(!c) {
    return res.render("index", {
      has: db.get("urls").length
    })
  }

  var name =c.split("<")[0];
  var pass =c.split("<")[1];
  var realpass =db.get(`account_${name}`).pass

  var i = db.get("urls")
  var u = db.all().filter(data => data.ID.startsWith(`account`)).sort((a, b) => b.data - a.data)
  var ir = 0;
  var g = "";
  for (ir in u) {
    g += `${u[ir].ID.split('_')[1]} <a style="background: transparent;" href="/b?pass=${pass}&user=${u[ir].ID.split('_')[1]}&type=ban">BAN</a> | <a style="background: transparent;" href="/b?pass=${pass}&user=${u[ir].ID.split('_')[1]}&type=delete">DELETE</a><br>`;
  }

  var ur = ""
  i.forEach(function(url) {
    var ugall = url.split("<")[0]
    ur += `${ugall} <a style="background: transparent;" href="/r?pass=${pass}&url=${url}">DELETE</a><br>`
  })

  var urr = ""
  i.forEach(function(url) {
    var ug = url.split("<")[0]
    var nug = url.split("<")[1]

    if(name === nug) {
      urr += `${ug}<br>`
    }
  })

  var acc = db.get(`account_${name}`)
  if(!acc) {
    return res.redirect("/logout")
  }

  if(pass !== realpass) {
    return res.redirect("/logout")
  }
  if(acc.ban) {
    return res.redirect("/logout")
  }
  
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
    members: g,
    your: urr
  })
})

/* REGISTER */
const { registerMax , registerMessage } = require("../config.json")

const registerLimit = rateLimit({
  windowMs: 86400000,
  max: 2,
  message: "Too many accounts added from this IP"
});

app.post("/register", registerLimit, async(req, res) => {
  var i = db.get("urls")
  var name = req.body.name
  var pass = req.body.pass
  var acc = db.get(`account_${name}`)

  if(acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account already exists!"
  }) 

  if(!name) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define name."
  })

  if(!pass) return res.render("error", {
    error: true,
    status: 400,
    error: "Please define pass."
  })

  if(name.includes("<" || ">" || "<script>" || "</script>") || encodeURIComponent(name).includes("%3C" || "%3E")) return res.render("error", {
    error: true,
    status: 400,
    error: "Please use normal characters"
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

  var name = req.body.name
  var pass = req.body.pass
  var acc = db.get(`account_${name}`)

  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exists"
  })

  var ir = 0;
  var g = "";
  for (ir in u) {
    g += `${u[ir].ID.split('_')[1]} <a style="background: transparent;" href="/b?pass=${acc.pass}&user=${u[ir].ID.split('_')[1]}&type=ban">BAN</a> | <a style="background: transparent;" href="/b?pass=${acc.pass}&user=${u[ir].ID.split('_')[1]}&type=delete">DELETE</a><br>`;
  }

  var ur = ""
  i.forEach(function(url) {
    var ugall = url.split("<")[0]
    ur += `${ugall} <a style="background: transparent;" href="/r?pass=${pass}&url=${url}">DELETE</a><br>`
  })

  var urr = ""
  i.forEach(function(url) {
    var ug = url.split("<")[0]
    var nug = url.split("<")[1]

    if(name === nug) {
      urr += `${ug}<br>`
    }
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

  res.cookie("login", acc.name + "<" + acc.pass);
  res.render("dashboard", {
    perms: perms,
    urls: ur,
    has: i.length,
    members: g,
    your: urr
  })
})

/* LOGOUT */
app.get("/logout", async(req, res) => {
  res.clearCookie("login");
  res.redirect("/") 
})

/* CREATE */
app.post("/create", async(req, res) => {
  var url = req.body.ur
  var u = db.get("urls")
  var c = req.cookies.login

  if(!c) {
    return res.render("index", {
      has: db.get("urls").length
    })
  }

  var name = c.split("<")[0];
  var pass = c.split("<")[1];

  var acc = db.get(`account_${name}`)
  if(!acc) {
    return res.render("error", {
        error: true,
        status: 400,
        error: "Please check user. User is bad"
    })
  }
  if(acc.pass != pass) {
    return res.render("error", {
        error: true,
        status: 400,
        error: "Please check password. Password is bad"
    })
  }

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

  db.push("urls",url + "<" + name)
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

  if(req.query.pass !== acc.pass) return res.render("error", {
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

  if(req.query.pass !== acc.pass) return res.render("error", {
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
