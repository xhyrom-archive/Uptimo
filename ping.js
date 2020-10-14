const db = require("quick.db")
const axios = require("axios");
const d = db.get("urls")

setInterval(() => {
    d.forEach(url => {
      axios.get(url).then(() => console.log("✅ - Succesfully pinged (" + url + ")")).catch((e) => {
      console.log("📛 - Failed ping (" + url + ")")
      })
    })
}, 60 * 1000)

d.forEach(url => {
  axios.get(url).then(() => console.log("✅ - Succesfully pinged (" + url + ")")).catch((e) => {
  console.log("📛 - Failed ping (" + url + ")")
  })
})
