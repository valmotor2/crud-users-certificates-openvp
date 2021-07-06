const RouterOS = require("routeros-client");
const basicFTP = require("basic-ftp");
const fs = require("fs");


const RouterOSClient = RouterOS.RouterOSClient;
const RouterOSAPI = RouterOS.RouterOSAPI;

const config = {
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
};

const PREFIX_PRIVATE_KEY = process.env.PREFIX_PRIVATE_KEY || "pr_";

class Mikrotik {
  _api = null;
  _client = null;

  constructor() {
    // close if this is missed after 5 seconds
    setTimeout(() => {
      if (this._api.isConnected()) {
        this._api.close();
      }
    }, 5000);
  }

  async connect() {
    this._api = new RouterOSClient(config);
    this._client = await this._api.connect();
  }

  async close() {
    await this._api.close();
  }

  /**
   * Get list of secrets OVPN
   * @listToNoDisplay - this is an array, which them will not display in the list.
   */
  getListOfOVPN = (listToNoDisplay = []) =>
    this._client
      .menu("/ppp/secret")
      //.where("type", "secret")
      .getAll()
      .then((results) =>
        results.filter((result) => listToNoDisplay.indexOf(result.name) === -1)
      );

  /**
   * @TODO, add @privateKey to createClientCertificate
   * Add an client OVPN
   * {
   * @name - string and unique
   * @password - string
   * @privateKey - string
   * }
   */
  addOVPN = ({ name, password }) =>
    this._client.menu("/ppp/secret").add({
      name,
      password,
      service: "ovpn",
      profile: "OPEN_VPN",
    });

  /**
   * @TODO, remove certificate of employee
   * @name - string and unique
   */
  removeOVPN = ({ name }) =>
    this._client.menu("/ppp/secret").remove({
      name,
    });

  /**
   * Create a certfificate for a employee, but don't sign it
   * @param {*} name - string
   */
  addCertificate = ({ name }) =>
    this._client.menu("/certificate").add({
      name,
      ["key-usage"]: "tls-client",
      ["common-name"]: name,
    });

  /**
   * Sign the certificate for a employee
   * {
   * @id - string
   * @name - string
   * }
   */
  signCertificate = ({ id, name }) =>
    this._client.menu("/certificate").exec(`sign`, {
      id: id,
      name: name,
      ca: "CA",
    });

  /**
   * If a certificate is already signed, will be only revoked util the CA certificate will be deleted
   * Don't do this if you aren't sure what is this.
   * {
   * @id - string
   * @name - string
   * }
   */
  revokeCertificate =  ({ id, name , ...params}) =>
    this._client
      .menu("/certificate")
      .remove({
        name,
        id,
      })
      .catch(async (err) => {
        if (
          err.message &&
          err.message.indexOf("failure: issued certificate can only be revoked") > -1
        ) {
          const rRouter = new RouterOSAPI(config)

          await rRouter.connect()
          await rRouter.write('/certificate/issued-revoke', `=.id=${id}`)

          await rRouter.close()
          return true;
          // console.log(await RouterOSAPI.write())
          // return await this._client.menu('/certificate').query('issued-revoke',name)
        }
        throw err;
      });

  /**
   * List all certificates created for employee
   * We have a secondary parameter whici will not display some certificates
   * @param listToNoDisplay - [string]?
   */
  getAllCertificates = (listToNoDisplay = []) =>
    this._client
      .menu("/certificate")
      .getAll()
      .then((results) =>
        results.filter((result) => listToNoDisplay.indexOf(result.name) === -1)
      );

  /**
   * Before download the certificate, it' need to protected with password, it's not mandatory
   * but to be sure, put it, it's free, just only your processor suffer a little. :)
   * @param {*} { @id - string, @password2 - string, @name - string }
   */
  exportCertificateEmployeeWithPassword = ({ id, password2, name }) =>
    this._client.menu("/certificate").exec("export-certificate", {
      id,
      ["export-passphrase"]: password2,
      ["file-name"]: `${PREFIX_PRIVATE_KEY}${name}`,
    });

  /**
   * generate file for openvpn with extension name_of_employee.ovpn
   * @param {*} profile - informations about the employee
   * @param {*} company - information about the company where the employees will connect it
   * @param {*} optionsConfig - add options in .ovpn file
   */
  generateFileOpenVPN = async (
    profile,
    company,
    optionsConfig = [],
    dirCertificate = ""
  ) => {
    if (!dirCertificate) {
      throw new Error(
        `The directory for downloading certificate is not defined,
         don't forget to add, also, in this directory the opvn directory.`
      );
    }
    const dir = dirCertificate;

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

    const files = await this.getPrivateCerts(profile, company.ca, dir);

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

    let fileForDownload = `${dir}/ovpn/${profile.name}.ovpn`;
    fs.writeFileSync(fileForDownload, appendToFile.join("\n"));

    return fileForDownload;
  };

  /**
   * { @name: string of employee, unique}
   * @ca - certificate
   * I don't have an solutions to get contents certs from API
   * So, the solutions for now is to read from FTP
   */
  getPrivateCerts = async ({ name }, ca, dir) => {
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

    if (filesRequested.length != 3)
      throw new Error(`We didn't found the certificates required, 
      it must provided 3 certificates, we received: ${filesRequested.length} certificates.`);

    const filesDownloaded = [];
    for (let i = 0; i < filesRequested.length; i++) {
      const file = filesRequested[i];
      const to = `${dir}/${file.name}`;
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

  /**
   * Search in the list of profiles and filter
   * @param name - string
   */
  searchProfile = async (name, exclude = []) => {
    const list = await this.getListOfOVPN(exclude);
    const exist = list.filter((each) => each.name === name);
    return exist.length ? exist[0] : null;
  };

  searchProfileById = async (id, exclude = []) => {
    const list = await this.getListOfOVPN(exclude);
    const exist = list.filter((each) => each.id === id);
    return exist.length ? exist[0] : null;
  };

  searchCertificate = async (name, exclude = []) => {
    const list = await this.getAllCertificates(exclude);
    const exist = list.filter((each) => each.name === name);

    return exist.length ? exist[0] : null;
  };

  searchCertificateById = async (id, exclude = []) => {
    const list = await this.getAllCertificates(exclude);
    const exist = list.filter((each) => each.id === id);
    return exist.length ? exist[0] : null;
  };
}

module.exports = Mikrotik;
