const express = require("express");

let app = express();

const page = ` <!DOCTYPE html>
<html>
<body>

<div id="demo">
  <h2>Let AJAX change this text</h2>

  <button type="button" onclick="loadDoc()">Change Content</button>
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

app.post("/post", (req, res) => {
  return res.redirect(
    `http://localhost:${4000}/authorize?client_id=EXAMPLE&type=google&identity=none&redirect_uri=http://localhost:3001/callback`
  );
});

app.post("/callback", (req, res) => {
  return res.send(page);
});
app.listen(3001);
