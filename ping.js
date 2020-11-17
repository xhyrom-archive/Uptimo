const { Database } = require("quickmongo");
//const dbold = require("quick.db")
const db = new Database
(process.env.db);
const axios = require("axios")

var check = {
  true: "online",
  false: "offline"
}

setInterval(async () => {
  const d = await db.get("urls")
  d.forEach(async (url) => {
    var r = url.split("<")[0]

    axios.get(r).then(async (res) => {
      await db.set(`status_${r}`, {
        status: true,
        statuscode: res.status,
        statustext: res.statusText
      })
      var status = await db.get(`status_${r}`)

      console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status.status]}`)
    }).catch(async (res, e) => {
      await db.set(`status_${r}`, {
        status: false,
        statuscode: res.status,
        statustext: res.statusText
      })
      var status = await db.get(`status_${r}`)

      console.log(`📛 Failed ping (${r}) | Status: ${check[status.status]}`)
    })
  })
}, 60 * 1000)

async function g() {
  const d = await db.get("urls")
  d.forEach(async (url) => {
    var r = url.split("<")[0]
    axios.get(r).then(async (res) => {
      await db.set(`status_${r}`, {
        status: true,
        statuscode: res.status,
        statustext: res.statusText
      })
      var status = await db.get(`status_${r}`)

      console.log(`✅ Succesfully pinged (${r}) | Status: ${check[status.status]}`)
    }).catch(async (res, e) => {
      await db.set(`status_${r}`, {
        status: false,
        statuscode: res.status,
        statustext: res.statusText
      })
      var status = await db.get(`status_${r}`)

      console.log(`📛 Failed ping (${r}) | Status: ${check[status.status]}`)
    })
  })
}

g()