const express = require("express");

let app = express();

const page = ` <!DOCTYPE html>
<html>
<body>

<div id="demo">
  <h2>Log in to see secret content!</h2>
  <a type="button" href="/login">Login</a></button>
</div>

</body>
</html> `;

const secretPage = ` <!DOCTYPE html>
<html>
<body>
  <h2>This is secret content!</h2>
  <p> You have logged in.</p>
</body>

</html> `;

app.get("/", (req, res) => {
  res.send(page);
});

app.get("/login", (req, res) => {
  return res.redirect(
    `http://localhost:${80}/initiate?client_id=EXAMPLE&strategy=pushover&identity=matas&redirect_uri=http://localhost:3001/callback`
  );
});

app.post("/callback", (req, res) => {
  // TODO: verify token
  return res.send(secretPage);
});
app.listen(3001);
console.log("Listening on 3001!");
