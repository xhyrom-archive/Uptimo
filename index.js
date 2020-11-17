const { Database } = require("quickmongo");
//const dbold = require("quick.db")
const db = new Database
(process.env.db);

const rateLimit = require("express-rate-limit");
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const fs = require('graceful-fs')
const delay = require("delay")

const express = require("express")
const app = express()


async function g() {
  const first = await db.get("first")
  if(!first || first !== "complete") {
    db.push("urls","https://uptime.hyrousek.tk")
    db.set("first","complete")
  }
}

g()
require("./ping.js")

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

/* API RUN */
fs.readdirSync(__dirname + '/api').forEach(f => require(`./api/${f}`)(app, db));

/* RENDER INDEX */
app.get("/", async(req, res) => {
  var i = await db.get("urls")
  var ff = await db.all()
  var u = ff.filter(data => data.ID.startsWith(`account`)).sort((a, b) => b.data - a.data)

  var c = req.cookies.login
  if(!c) {
    return res.render("index", {
      has: i.length
    })
  }

  var name =c.split("<")[0];
  var pass =c.split("<")[1];
  var acc = await db.get(`account_${name}`)

  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exist"
  })

  var ir = 0;
  var g = "";
  for (ir in u) {
    if(u[ir].data.name !== process.env.adminname) {
      g += `${u[ir].data.name} <a style="background: transparent;" href="/b?name=${acc.name}&pass=${acc.pass}&user=${u[ir].data.name}&type=ban">BAN</a> | <a style="background: transparent;" href="/b?name=${acc.name}&pass=${acc.pass}&user=${u[ir].data.name}&type=delete">DELETE</a><br>`;
    } else {
      g += `${u[ir].data.name} | ADMIN`;
    }
  }

  var ur = "";
  i.forEach(async function(url) {
    var ugall = url.split("<")[0]
    ur += `${ugall} <a style="background: transparent;" href="/r?name=${acc.name}&pass=${acc.pass}&url=${url}">DELETE</a><br>`
  })

  var urrr = "";
  i.forEach(async function(url) {
    var ug = url.split("<")[0]
    var nug = url.split("<")[1]

    var status = await db.get(`status_${ug}`)
    if(status === undefined || !status) {
      if(name === nug) {
        urrr += `${ug} ➜ ⏲️ Please wait 1m to check! | <a style="background: transparent;" href="/r?d=my&pass=${acc.pass}&url=${url}">DELETE</a><br>`
      }
      return;
    }

    var check = {
      true: "✅ Online",
      false: "❌ Offline",
      undefined: "⏲️ Please wait 1m to check!"
    }
    
    if(name === nug) {
      urrr += `${ug} ➜ ${check[status.status]} | <a style="background: transparent;" href="/r?d=my&pass=${acc.pass}&url=${url}">DELETE</a><br>`
    }
  })
  if(pass !== acc.pass) return res.redirect("/logout")

  if(acc.ban) return res.redirect("/logout")

  var perms;
  if(acc.name === process.env.adminname) {
    perms = true
  } else {
    perms = false
  }

  await delay(1000)
  res.render("dashboard", {
    perms: perms,
    urls: ur,
    has: i.length,
    members: g,
    your: urrr
  })
})

/* REGISTER */
const { registerMax , registerMessage } = require("./config.json")

const registerLimit = rateLimit({
  windowMs: 86400000,
  max: registerMax,
  message: registerMessage
});

app.post("/register", registerLimit, async(req, res) => {
  var i = await db.get("urls")
  var name = req.body.name
  var pass = req.body.pass
  var acc = await db.get(`account_${name}`)

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
  var i = await db.get("urls")
  var ff = await db.all()
  var u = ff.filter(data => data.ID.startsWith(`account`)).sort((a, b) => b.data - a.data)

  var name = req.body.name
  var pass = req.body.pass
  var acc = await db.get(`account_${name}`)

  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exist"
  })

  var ir = 0;
  var g = "";
  for (ir in u) {
    if(u[ir].data.name !== process.env.adminname) {
      g += `${u[ir].data.name} <a style="background: transparent;" href="/b?name=${acc.name}&pass=${acc.pass}&user=${u[ir].data.name}&type=ban">BAN</a> | <a style="background: transparent;" href="/b?name=${acc.name}&pass=${acc.pass}&user=${u[ir].data.name}&type=delete">DELETE</a><br>`;
    } else {
      g += `${u[ir].data.name} | ADMIN`;
    }
  }

  var ur = "";
  i.forEach(async function(url) {
    var ugall = url.split("<")[0]
    ur += `${ugall} <a style="background: transparent;" href="/r?name=${acc.name}&pass=${acc.pass}&url=${url}">DELETE</a><br>`
  })

  var urr = "";
  i.forEach(async function(url) {
    var ug = url.split("<")[0]
    var nug = url.split("<")[1]

    var status = await db.get(`status_${ug}`)
    if(status === undefined || !status) {
      if(name === nug) {
        urr += `${ug} ➜ ⏲️ Please wait 1m to check! | <a style="background: transparent;" href="/r?d=my&pass=${acc.pass}&url=${url}">DELETE</a><br>`
      }
      return;
    }

    var check = {
      true: "✅ Online",
      false: "❌ Offline",
      undefined: "⏲️ Please wait 1m to check!"
    }
    
    if(name === nug) {
      urr += `${ug} ➜ ${check[status.status]} | <a style="background: transparent;" href="/r?d=my&pass=${acc.pass}&url=${url}">DELETE</a><br>`
    }
  })

  const match = await bcrypt.compare(pass, acc.pass);

  if(!match) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check password. Password is bad"
  })

  if(acc.ban) return res.render("error", {
    error: true,
    status: 400,
    error: "Your account is disabled :("
  })

  var perms;
  if(acc.name === process.env.adminname) {
    perms = true
  } else {
    perms = false
  }

  await delay(1000)
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

/* RESETPASS */
app.get("/resetpass", async(req, res) => {
  var c = req.cookies.login
  var tt = await db.get("urls")

  if(!c) {
    return res.render("index", {
      has: tt.length
    })
  }

  var name = c.split("<")[0];
  var pass = c.split("<")[1];

  var acc = await db.get(`account_${name}`)
  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exist"
  })
  if(acc.pass != pass) {
    return res.render("error", {
        error: true,
        status: 400,
        error: "Please check password. Password is bad"
    })
  }

  var tt = await db.get("urls")
  res.render("resetpass", {
    has: tt.length
  })
})

/* CREATE */
app.post("/create", async(req, res) => {
  var url = req.body.ur
  var u = await db.get("urls")
  var c = req.cookies.login

  if(!c) {
    return res.render("index", {
      has: u.length
    })
  }

  var name = c.split("<")[0];
  var pass = c.split("<")[1];

  var acc = await db.get(`account_${name}`)
  if(!acc) return res.render("error", {
    error: true,
    status: 400,
    error: "Account not exist"
  })
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

  var ui = [];
  var ur = ""
  u.forEach(function(url) {
    var ugall = url.split("<")[0]
    ui.push(ugall)
  })

  if (ui.indexOf(url) > -1) {
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

/* BAN USER & REMOVE URL */
app.get("/b", async(req, res) => {
  const acc = await db.get(`account_${process.env.adminname}`)

  if(req.query.name !== acc.name) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check name. Name is bad"
  })

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

  var del = await db.get(`account_${req.query.user}`)
  if(!del) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check user. User is bad"
  })

  if(req.query.type === "ban") {
    var old = await db.get(`account_${req.query.user}`)
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
   if(req.query.type === "unban") {
    var old = await db.get(`account_${req.query.user}`)
    db.set(`account_${req.query.user}`, {
      pass: old.pass,
      name: old.name,
      ban: false
    })

    return res.render("error", {
        error: false,
        status: 200,
        error: "User succesfully unbanned!"
    })
  }

  if(req.query.type === "delete") {
    const u = await db.get("urls")
    var yurl = []

    u.forEach(function(url) {
      var n = url.split("<")[1]
      if(n === req.query.user) {
        yurl.push(url)
      }
    })

    yurl.forEach(async function(url) {
      var array = await db.get("urls");
      array = array.filter(v => v !== url);
      db.set("urls", array)
      db.delete(`status_${url.split("<")[0]}`)
    })

    console.log(u)
    db.delete(`account_${req.query.user}`)

    return res.render("error", {
        error: false,
        status: 200,
        error: "User succesfully deleted!"
    })
  }
})

app.get("/r", async(req, res) => {
  if(req.query.d === "my") {
    const acc = await db.get(`account_${req.cookies.login.split("<")[0]}`)
    if(!acc) return res.render("error", {
      error: true,
      status: 400,
      error: "Account not exist"
    })

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

    if(!req.query.url.includes("<")) return res.render("error", {
      error: true,
      status: 400,
      error: `Url not includes "<"`
    })

    var ar = []
    if(req.query.url.includes("<")) {
      var my = req.query.url.split("<")[1]
      const u = await db.get("urls")

      if(my === acc.name) {
        if (u.indexOf(req.query.url) > -1) {
          var array = await db.get("urls");
          array = array.filter(v => v !== req.query.url);
          db.set("urls", array)
          db.delete(`status_${req.query.url.split("<")[0]}`)

          res.render("error", {
              error: false,
              status: 200,
              error: "URL is deleted! (" + req.query.url.split("<")[0] + ")"
          }) 
        return;
        }
      } else {
        return res.render("error", {
            error: true,
            status: 400,
            error: "This url is not added on your account."
        })
      }
    }

    return res.render("error", {
        error: true,
        status: 400,
        error: "Please check url. Url is not on db"
    }) 
  }

  const acc = await db.get(`account_${process.env.adminname}`)
  const u = await db.get("urls")

  if(req.query.name !== acc.name) return res.render("error", {
    error: true,
    status: 400,
    error: "Please check name. Name is bad"
  })

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
    var array = await db.get("urls");
    array = array.filter(v => v !== req.query.url);
    db.set("urls", array)
    db.delete(`status_${req.query.url.split("<")[0]}`)

    res.render("error", {
        error: false,
        status: 200,
        error: "URL is deleted! (" + req.query.url.split("<")[0] + ")"
    }) 
  return;
  }

  return res.render("error", {
      error: true,
      status: 400,
      error: "Please check url. Url is not on db"
  }) 
})

/* RESET PASS POST */
app.post("/rp", async(req, res) => {
    const acc = await db.get(`account_${req.cookies.login.split("<")[0]}`)
    if(!acc) return res.render("error", {
      error: true,
      status: 400,
      error: "Account not exist"
    })

    if(!req.body.oldpass) return res.render("error", {
      error: true,
      status: 400,
      error: "Please define old password."
    })

    if(!req.body.newpass) return res.render("error", {
      error: true,
      status: 400,
      error: "Please define new password."
    })


    const match = await bcrypt.compare(req.body.oldpass, acc.pass);

    if(!match) return res.render("error", {
      error: true,
      status: 400,
      error: "Please check password. Password is bad"
    })

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.newpass, salt)

    db.set(`account_${req.cookies.login.split("<")[0]}`, {
      pass: hash,
      name: acc.name,
      ban: acc.ban
    })

    return res.render("error", {
      error: false,
      status: 200,
      error: "Password succesfully changed ("+req.body.newpass+")"
    }) 
})

app.listen(process.env.port || 5000, () => {
  console.log("Website started")
})