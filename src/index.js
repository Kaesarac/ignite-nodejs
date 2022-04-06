const express = require("express");

const app = express();
const port = 3000;

app.listen(port); //starts app

app.get("/", (req, res) => {
  return res.send("Hello caraio");
});

console.log(`Listening on PORT ${port}`);
