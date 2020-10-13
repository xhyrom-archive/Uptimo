const db = require("quick.db")
const axios = require("axios");

u()
function u() {
  setInterval(() => {
      var d = db.get("urls")
      d.forEach(url => {
        axios.get(url).then(() => console.log("Ping at " + Date.now() + " ("+url+")")).catch((e) => {
        console.log("Unable ping " + url)
        })
      })
  }, 60 * 1000)

  var d = db.get("urls")
  d.forEach(url => {
    axios.get(url).then(() => console.log("Ping at " + Date.now() + " ("+url+")")).catch((e) => {
    console.log("Unable ping " + url)
    })
  })
}
