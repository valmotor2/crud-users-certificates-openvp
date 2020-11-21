const Router = require("express").Router;
const Mikrotik = require("./Mikrotik");
const router = Router();

const EXCLUDE_CERTIFICATE_FOR_DISPLAY =
  process.env.EXCLUDE_CERTIFICATE_FOR_DISPLAY?.split(",") || [];
const EXCLUDE_PROFILES_FOR_DISPLAY =
  process.env.EXCLUDE_PROFILES_FOR_DISPLAY?.split(",") || [];

/**
 * List all certs
 */
router.get("/certificates", async (req, res) => {
  let list = [];
  try {
    const mik = new Mikrotik();
    await mik.connect();
    list = await mik.getAllCertificates(EXCLUDE_CERTIFICATE_FOR_DISPLAY);
    await mik.close();
    return res.json({ certificates: list });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

/**
 * Sing the certificate if isn't.
 */
router.put("/certificates/sign", async (req, res) => {
  return res.json({
    message: "TODO",
  });
});

/**
 * Download certificate
 * @id - string
 * @todo
 */
router.get("/certificates/downloads/:id", (req, res) => {
  res.status(400).json({
    ...req.parmas,
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
    list = await mik.getListOfOVPN(EXCLUDE_PROFILES_FOR_DISPLAY);
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
  const { name, password } = body;
  if (!name || !password) {
    return res.status(400).json({
      message: "Campurile nu sunt completate.",
    });
  }

  try {
    const mik = new Mikrotik();
    await mik.connect();
    // check if this already exists!
    const existCertificate = await mik.searchCertificate(
      name,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );
    if (existCertificate) {
      return res.status(400).json({
        message: `Numele: ${name} exista deja la certificate, va rugam incercati altul.`,
      });
    }

    const existProfil = await mik.searchProfile(
      name,
      EXCLUDE_PROFILES_FOR_DISPLAY
    );
    if (existProfil) {
      return res.status(400).json({
        message: `Numele: ${name} exista deja la certificate, va rugam incercati altul.`,
      });
    }

    const added = await mik.addOVPN({ name, password });

    // after created
    await mik.addCertificate(added);

    await mik.close();
    return res.json({ added });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message,
    });
  }
});

/**
 * @todo this is not used, I think
 */
router.delete("/ovpn/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const mik = new Mikrotik();
    await mik.connect();
    const profile = await mik.searchProfileById(
      id,
      EXCLUDE_PROFILES_FOR_DISPLAY
    );

    const certificate = await mik.searchCertificate(
      profile.name,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );

    if (certificate) {
      // revoke it !
      await mik.revokeCertificate(certificate);
    }
    await mik.removeOVPN(profile);
    await mik.close();
    return res.json({ message: "deleted" });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

module.exports = router;
