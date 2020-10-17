const db = require("quick.db")
const fetch = require("node-fetch")
const d = db.get("urls")

var check = {
  true: "online",
  false: "offline"
}

setInterval(() => {
  d.forEach(url => {
    var r = url.split("<")[0]
    fetch(r).then(() => {
      var status = db.get(`status_${r}`)
      db.set(`status_${r}`, true)

      console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status]}`)
    }).catch((e) => {
      var status = db.get(`status_${r}`)
      db.set(`status_${r}`, false)
      console.log(`📛 Failed ping (${r}) | Status: ${check[status]}`)
    })
  })
}, 60 * 1000)

d.forEach(url => {
  var r = url.split("<")[0]
  fetch(r).then(() => {
    var status = db.get(`status_${r}`)
    db.set(`status_${r}`, true)
    console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status]}`)
  }).catch((e) => {
    var status = db.get(`status_${r}`)
    db.set(`status_${r}`, false)
    console.log(`📛 Failed ping (${r}) | Status: ${check[status]}`)
  })
})
