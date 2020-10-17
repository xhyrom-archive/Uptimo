const db = require("quick.db")
const fetch = require("node-fetch")
const d = db.get("urls")

setInterval(() => {
  d.forEach(url => {
    var r = url.split("<")[0]
    fetch(r).then(() => {
      db.set(`status_${r}`, true)
      console.log("✅ - Succesfully pinged (" + r + ")")
    }).catch((e) => {
      db.set(`status_${r}`, false)
      console.log("📛 Failed ping (" + r + ")")
    })
  })
}, 60 * 1000)

d.forEach(url => {
  var r = url.split("<")[0]
  fetch(r).then(() => {
    db.set(`status_${r}`, true)
    console.log("✅ - Succesfully pinged (" + r + ")")
  }).catch((e) => {
    db.set(`status_${r}`, false)
    console.log("📛 Failed ping (" + r + ")")
  })
})
