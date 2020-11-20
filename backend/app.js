require("dotenv").config();
const RouterOSClient = require("routeros-client").RouterOSClient;
const basicFTP = require("basic-ftp");
const fs = require("fs");

/**
 * Enable API and FTP from IP.Services
 * Don't forget to put a condition to firewall for better safe!
 */
const config = {
  host: process.env.MIKROTIK_HOST,
  user: process.env.MIKROTIK_USER,
  password: process.env.MIKROTIK_PASS,
};
const api = new RouterOSClient(config);

// @TODO - this is for testing, remove when is the case.
const testing = require("./testing");

// const mokup = {
//   id: "", // after created an profile, you will have an id
//   name: "", // name, must be unique and no spaces, just letters and dots
//   password: "", // this will be password of user
//   password2: "", // this will be the password of private key certificate
// };

const PREFIX_PRIVATE_KEY = "pr_";

/**
 * Get list of secrets OVPN
 * @client
 * @listToNoDisplay - this is an array, which them will not display in the list.
 */
const getListOfOVPN = (client, listToNoDisplay = []) =>
  client
    .menu("/ppp/secret")
    //.where("type", "secret")
    .getAll()
    .then((results) =>
      results.filter((result) => listToNoDisplay.indexOf(result.name) === -1)
    );

/**
 * @TODO, add @privateKey to createClientCertificate
 * Add an client OVPN
 * @client
 * @name - string and unique
 * @password - string
 * @privateKey - string
 */
const addOVPN = (client, { name, password }) =>
  client.menu("/ppp/secret").add({
    name,
    password,
    service: "ovpn",
    profile: "OPEN_VPN",
  });

/**
 * @TODO, remove certificate of employee
 * @client
 * @name - string and unique
 */
const removeOVPN = (client, { name }) =>
  client.menu("/ppp/secret").remove({
    name,
  });

/**
 * Create a certfificate for a employee, but don't sign it
 * @param {*} client
 * @param {*} name - string
 */
const addCertificate = (client, { name }) =>
  client.menu("/certificate").add({
    name,
    ["key-usage"]: "tls-client",
    ["common-name"]: name,
  });

/**
 * Sign the certificate for a employee
 * @param {*} client
 * @param {*} param1
 */
const signCertificate = (client, { id, name }) =>
  client.menu("/certificate").exec(`sign`, {
    id: id,
    name: name,
    ca: "CA",
  });

/**
 * If a certificate is already signed, will be only revoked util the CA certificate will be deleted
 * Don't do this if you aren't sure what is this.
 * @param {*} client
 * @param {*} param1
 */
const revokeCertificate = (client, { id, name }) =>
  client
    .menu("/certificate")
    .remove({
      name,
      id,
    })
    .catch((err) => {
      if (
        err.message &&
        err.message.indexOf("issued certificate can only be revoked") > -1
      ) {
        return client.menu(
          "/certificate",
          exec("revoke", {
            id,
          })
        );
      }
      throw err;
    });

/**
 * List all certificates created for employee
 * We have a secondary parameter whici will not display some certificates
 * @param {*} client
 * @param {*} listToNoDisplay
 */
const getAllCertificates = (client, listToNoDisplay = []) =>
  client
    .menu("/certificate")
    .getAll()
    .then((results) =>
      results.filter((result) => listToNoDisplay.indexOf(result.name) === -1)
    );

/**
 * Before download the certificate, it' need to protected with password, it's not mandatory
 * but to be sure, put it, it's free, just only your processor suffer a little. :)
 * @param {*} client
 * @param {*} { @id - string, @password2 - string, @name - string }
 */
const exportCertificateEmployeeWithPassword = (
  client,
  { id, password2, name }
) =>
  client.menu("/certificate").exec("export-certificate", {
    id,
    ["export-passphrase"]: password2,
    ["file-name"]: `${PREFIX_PRIVATE_KEY}${name}`,
  });

/**
 * generate file for openvpn with extension name_of_employee.ovpn
 * @param {*} client - client from api mikrotik
 * @param {*} employee - informations about the employee
 * @param {*} company - information about the company where the employees will connect it
 * @param {*} optionsConfig - add options in .ovpn file
 */
const generateFileOpenVPN = async (
  client,
  employee,
  company,
  optionsConfig = [
    "route 192.168.0.5 255.255.255.255",
    "route 192.168.0.1 255.255.255.255",
    'pull-filter ignore "route-gateway"',
  ]
) => {
  const appendToFile = [
    "client",
    "dev tun",
    "proto tcp-client",
    `remote ${company.host}`,
    `port ${company.port}`,
    "resolv-retry infinite",
    "nobind",
    "persist-key",
    "persist-tun",
    "remote-cert-tls server",
    "cipher AES-256-CBC",
    "auth SHA1",
    "verb 3",
    "pull",
    "auth-user-pass",
    "keepalive 600 1800",
    ...optionsConfig,
  ];

  const files = await getPrivateCerts(employee, company.ca);

  let contentOfFiles = {
    ca: "",
    crt: "",
    key: "",
  };

  for (let file of files) {
    const content = fs.readFileSync(file, "utf-8");

    if (file.includes(company.ca)) {
      contentOfFiles["ca"] = content;
    } else {
      const ext = file.substr(file.lastIndexOf(".") + 1);

      if (ext === "crt") {
        contentOfFiles["crt"] = content;
      } else if (ext === "key") {
        contentOfFiles["key"] = content;
      }
    }
  }

  const ca = `
<ca>
${contentOfFiles.ca}
</ca>
`;

  const cert = `
<cert>
${contentOfFiles.crt}
</cert>
`;

  const key = `
<key>
${contentOfFiles.key}
</key>
`;

  appendToFile.push(ca);
  appendToFile.push(cert);
  appendToFile.push(key);

  let fileForDownload = `${process.env.DIR}ovpn/${employee.name}.ovpn`;
  fs.writeFileSync(fileForDownload, appendToFile.join("\n"));

  return fileForDownload;
};

/**
 * { @name: string of employee, unique}
 * @ca - certificate
 * I don't have an solutions to get contents certs from API
 * So, the solutions for now is to read from FTP
 */
const getPrivateCerts = async ({ name }, ca = "CA.key") => {
  const dir = process.env.DIR;

  const ftp = new basicFTP.Client();

  await ftp.access(config);

  const searchFiles = [
    `${PREFIX_PRIVATE_KEY}${name}.key`,
    `${PREFIX_PRIVATE_KEY}${name}.crt`,
    `${ca}`,
  ];

  const files = await ftp.list();
  const filesRequested = files.filter(
    (file) => searchFiles.indexOf(file.name) > -1
  );

  // if (filesRequested.length != 3)
  //   throw new Error("We didn't found the certificates required.");

  const filesDownloaded = [];
  for (let i = 0; i < filesRequested.length; i++) {
    const file = filesRequested[i];
    const to = `${dir}${file.name}`;
    await ftp.downloadTo(to, file.name);
    filesDownloaded.push(to);
    // clean on mikrotik router the files generated for employee
    // we have already in certificates, it's not necessary to have in files of mikrotik
    // with exception of CA
    // @TODO, on future, maybe we generate also CA and delete it after.
    if (file.name !== ca) await ftp.remove(file.name);
  }

  return filesDownloaded;
};

// @TODO, remove this after we will finish all functions
const start = async () => {
  try {
    const client = await api.connect();

    // // List of OVPN
    // const listOvpn = await getListOfOVPN(client, [
    //   "it.bestcall.ro",
    // ]).catch((err) => console.log(`Error at get list`, err));
    // console.log("list of OVPN", listOvpn);

    // // Create of OVPN
    // const added = await addOVPN(
    //   client,
    //   testing,
    // ).catch((err) => console.log(`Error adding a new openVPN client`, err));
    // console.log(`Added:`, added);

    // // Delete of OVPN
    // await removeOVPN(client, testing).catch((err) =>
    //   console.log("Error deleted: ", err)
    // );

    // Add a certificate
    // const addedCertificate = await addCertificaClient(
    //   client,
    //   testing
    // ).catch((err) => console.log("Error add certificate", err));
    // console.log(addedCertificate);

    // Sign a certificate
    // const signed = await signCertificateClient(client, testing);
    // console.log(signed);

    // Remove a certificate if isn't signed!
    // await revokeCertificateClient(client, testing);

    // Display all certificates
    // const allCertificates = await getAllCertificates(client, [
    //   "CA",
    //   "Server",
    //   "Client",
    // ]);
    // console.log(allCertificates);

    await generateFileOpenVPN(client, testing, {
      host: "xxx.xx",
      port: "yyy",
      ca: "cert_export_CA.crt",
    });

    //await getPrivateCerts(testing, "cert_export_CA.crt");
  } catch (err) {
    console.log("Error API: ", err);
  } finally {
    api.close();
  }
};

start();
