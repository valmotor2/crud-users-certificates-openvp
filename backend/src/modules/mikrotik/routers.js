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
  const { id = "*0" } = res.parmas;

  req.json({
    id,
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
 * Will not be used, it's not necessary, we keep simple
 * @id - string
 */
router.get("/ovpns/:id", (req, res) => {
  res.json({
    message: "Unused",
  });
});

/**
 * Create an ovpn for an employee
 */
router.post("/ovpn", async (req, res) => {
  const { body } = req;

  // make simple checking
  const { name, password, password2 } = body;
  if (!name || !password || !password2) {
    return res.status(400).json({
      message: "Campurile nu sunt completate.",
    });
  }

  try {
    const mik = new Mikrotik();
    await mik.connect();

    // check if this already exists!
    list = await mik.getAllCertificates(["CA", "Server", "Client"]);

    const alreadyExists = list.filter((each) => each.name === name);
    if (alreadyExists.length > 0) {
      return res.status(400).json({
        message: `Numele: ${name} exista deja, va rugam incercati altul.`,
      });
    }

    const added = await mik.addOVPN({ name, password });
    await mik.close();
    return res.json({ added });
  } catch (err) {
    return res.status(404).json({
      message: err.message,
    });
  }
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
