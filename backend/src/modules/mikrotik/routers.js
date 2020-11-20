const Router = require("express").Router;
const Mikrotik = require("./Mikrotik");
const router = Router();

/**
 * List all certs
 */
router.get("/certificates", async (req, res) => {
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
router.post("/certificates", (res, req) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * Delete or revoke the cert if is already signed
 * @id - string
 */
router.delete("/certificates/:id", (res, req) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * List al secrets of employee
 */
router.get("/ovpns", async (req, res) => {
  let list = [];
  try {
    const mik = new Mikrotik();
    await mik.connect();
    list = await mik.getListOfOVPN(["it.bestcall.ro"]);
    await mik.close();
    return res.json({ employee: list });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

/**
 * Get ovpn of employee by id
 * @id - string
 */
router.get("/ovpns/:id", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * Create an ovpn for an employee
 */
router.post("/ovpn", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

/**
 * @todo this is not used, I think
 */
router.delete("/ovpn/:id", (req, res) => {
  const list = [];
  res.json({
    ...list,
  });
});

module.exports = router;
