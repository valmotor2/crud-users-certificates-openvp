// Here will start everthig ...
require("dotenv").config();
const Mikrotik = require("./modules/mikrotik/Mikrotik");

const express = require("express");
const app = express();
const port = 3003;

/**
 * List all certs
 */
app.get("/certificates", async (req, res) => {
  let list = [];
  try {
    const mik = new Mikrotik();
    await mik.connect();
    list = await mik.getAllCertificates(["CA", "Server", "Client"]);
    await mik.close();
    return res.json({ certificates: list });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

/**
 * Create a cert
 */
app.post("/certificates", (res, req) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * Delete or revoke the cert if is already signed
 * @id - string
 */
app.delete("/certificates/:id", (res, req) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * List al secrets of employee
 */
app.get("/ovpns", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * Get ovpn of employee by id
 * @id - string
 */
app.get("/ovpns/:id", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * Create an ovpn for an employee
 */
app.post("/ovpn", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * @todo this is not used, I think
 */
app.delete("/ovpn/:id", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

// Listen server start
app.listen(port, () => {
  console.log(`Listened on port: ${port}`);
});
