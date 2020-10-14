const db = require("quick.db")
const fetch = require("node-fetch")
const d = db.get("urls")

setInterval(() => {
  d.forEach(url => {
    fetch(url).then(() => {
      console.log("✅ - Succesfully pinged (" + url + ")")
    }).catch((e) => {
      console.log("📛 Failed ping (" + url + ")")
    })
  })
}, 60 * 1000)

d.forEach(url => {
  fetch(url).then(() => {
    console.log("✅ - Succesfully pinged (" + url + ")")
  }).catch((e) => {
    console.log("📛 Failed ping (" + url + ")")
  })
})
