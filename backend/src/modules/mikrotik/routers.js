const Router = require("express").Router;
const Mikrotik = require("./Mikrotik");

const fs = require("fs");
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
 * Get certificate by ID
 * @id - string
 */
router.get("/certificates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const mik = new Mikrotik();
    await mik.connect();
    certificate = await mik.searchCertificateById(
      id,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );
    await mik.close();
    return res.json({ certificate });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "Certificatul nu a fost gasit.",
    });
  }
});

/**
 * Sing the certificate if isn't.
 */
router.post("/certificates/sign", async (req, res) => {
  try {
    const mik = new Mikrotik();
    await mik.connect();

    const { name = "" } = req.body;
    const exist = await mik.searchCertificate(
      name,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );
    if (!exist) {
      return res.status(404).json({
        message: "Nu exista acest certificat.",
      });
    }
    list = await mik.signCertificate(exist);
    await mik.close();
    return res.json({ certificates: list });
  } catch (err) {
    console.log("error", err);
    return res.status(404).json({
      message: "Nu exista acest certificat.",
    });
  }
});

/**
 * Download certificate
 * @id - string
 * @todo
 */
router.post("/certificates/downloads", async (req, res) => {
  const { certificate: certificatBody, password } = req.body;
  // check some
  try {
    const mik = new Mikrotik();
    await mik.connect();
    certificate = await mik.searchCertificate(
      certificatBody.name,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );
    if (!password) {
      return res.status(400).json({
        message: "Nu ati furnizat o parola pentru cheia privata.",
      });
    }

    if (
      !certificate ||
      !certificate.fingerprint ||
      certificate.fingerprint !== certificatBody?.fingerprint
    ) {
      return res.status(404).json({
        message:
          "Certificatul nu a fost gasit sau nu este valid, poate trebuie semnat inainte?",
      });
    }

    const profile = await mik.searchProfile(
      certificate.name,
      EXCLUDE_PROFILES_FOR_DISPLAY
    );

    const company = {
      host: process.env.OVPN_SERVER_HOST || "",
      port: process.env.OVPN_SERVER_PORT || 0,
      ca: process.env.OVPN_CA || "",
    };
    const options = process.env.OVPN_ADD_OPTIONS_TO_FILE?.split(",") || [];

    await mik.exportCertificateEmployeeWithPassword({
      id: certificate.id,
      name: certificate.name,
      password2: password,
    });

    const generatedFile = await mik.generateFileOpenVPN(
      profile,
      company,
      options,
      process.env.DIR_PATH_TO_DOWNLOAD
    );
    await mik.close();
    if (fs.existsSync(generatedFile)) {
      return res.sendFile(generatedFile);
    }

    return res.status(404).json({
      message: "Fisierul generat .ovpn lipseste, incercati din nou.",
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: "Certificatul nu a fost gasit.",
    });
  }
});

/**
 * Delete or revoke the cert if is already signed
 * @id - string
 */
router.delete("/certificates/:id", async (req, res) => {
  const { id = "*0" } = req.params;

  
  try {
    const mik = new Mikrotik();
    await mik.connect();

    const certificate = await mik.searchCertificateById(
      id,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );
    await mik.revokeCertificate(certificate)
    await mik.close();    
    return res.json(certificate);

  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
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
 * @TODO
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

    // @todo
    /*
    const certificate = await mik.searchCertificate(
      profile.name,
      EXCLUDE_CERTIFICATE_FOR_DISPLAY
    );

    if (certificate) {
      // revoke it !
      mik.revokeCertificate(certificate).catch(err => console.log(err))
    }
    */
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
