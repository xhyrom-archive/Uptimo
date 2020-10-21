const db = require("quick.db")
const fetch = require("node-fetch")

var check = {
  true: "online",
  false: "offline"
}

setInterval(() => {
  const d = db.get("urls")
  d.forEach(url => {
    var r = url.split("<")[0]
    fetch(r).then((res) => {
      var status = db.get(`status_${r}`)
      db.set(`status_${r}`, {
        status: true,
        statuscode: res.status,
        statustext: res.statusText
      })

      console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status.status]}`)
    }).catch((res, e) => {
      var status = db.get(`status_${r}`)
      db.set(`status_${r}`, {
        status: false,
        statuscode: res.status,
        statustext: res.statusText
      })

      console.log(`📛 Failed ping (${r}) | Status: ${check[status.status]}`)
    })
  })
}, 60 * 1000)

const d = db.get("urls")
d.forEach(url => {
  var r = url.split("<")[0]
  fetch(r).then((res) => {
    var status = db.get(`status_${r}`)
    db.set(`status_${r}`, {
      status: true,
      statuscode: res.status,
      statustext: res.statusText
    })

    console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status.status]}`)
  }).catch((res, e) => {
    var status = db.get(`status_${r}`)
    db.set(`status_${r}`, {
      status: false,
      statuscode: res.status,
      statustext: res.statusText
    })

    console.log(`📛 Failed ping (${r}) | Status: ${check[status.status]}`)
  })
})
