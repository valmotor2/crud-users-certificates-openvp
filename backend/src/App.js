// Here will start everthig ...
require("dotenv").config();

const express = require("express");
const app = express();
const port = 3003;
const cors = require("cors");

const routers = require("./modules/mikrotik/routers");

app.use(express.json());
/** Here you can put some conditions, cors, limits , etc ... */
app.use("/", cors(), routers);

app.use((req, res, next) => {
  return res.status(404).json({
    message: "Page not found",
    code: 404,
  });
});

app.use((err, req, res, next) => {
  console.log(`Error: `, err);
  return res.status(500).json({
    code: 500,
    message: err.message || err,
  });
});

// Listen server start
app.listen(port, () => {
  console.log(`Listened on port: ${port}`);
});
