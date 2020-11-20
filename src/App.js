// Here will start everthig ...
const express = require("express");
const app = express();
const port = 3003;

app.get("/certificates", (res, req) => {
  const list = [];
  res.json({
    ...list,
  });
});

app.get("/ovpns", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

app.listen(port, () => {
  console.log(`Listened on port: ${port}`);
});
