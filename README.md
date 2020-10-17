<div align="center">
   <h1>Uptimo</h1>
 </div>
 
🍭 Open-Source uptime script! [Demo](https://uptime.hyrousek.tk/)<br>
🍬 Database: SQLITE (quick.db)<br>
🍫 Language: JavaScript, HTML (NodeJS)<br>
🧁 Start cmd: node index.js<br>
🍩 Using: <a href="https://dev.hyrousek.tk">BeautifulCSS</a> (I made lol :D)

### Repl.it 💼
[![Deploy to Repl.it](https://repl.it/badge/github/xHyroM/uptimo)](https://repl.it/github/xHyroM/uptimo)
<br>
Quick.db error?<br>
<b>Fork <a href="https://repl.it/@xHyroM/Uptimo">this</a> project! [![FP](https://imgur.com/ASCKbYc.png)]</b>

### License
You have to code "Made By Hyro" somewhere in the index.html or in that card 
```
<!-- Made by Hyro -->
or 
<div class="card center">
    <p>Links: <%= has %></p>
    <hr style="opacity: 10%">
    <p>Made by <a href="https://hyrousek.tk" style="background: transparent;">HyRo</a><br>
    Github <a href="https://github.com/xHyroM/Uptimo/" style="background: transparent;">repo</a>
    </p>
</div>
```

### WARNING
If you want to ping your project it must contain the npm express plugin and this code:
```js
const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
  res.send('For pinging')
})
 
app.listen(process.env.port || 3000, async() => {
  console.log("Ping website started")
})
```

### Features
- Login & Register system
- Url deletion system
- Banning, deleting accounts and deleting links system for admins
- Easy setup
