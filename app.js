require("dotenv").config();
const express = require("express");
const app = express();
const port = 3003;

const RouterOSClient = require("routeros-client").RouterOSClient;

const api = new RouterOSClient({
  host: process.env.MIKROTIK_HOST,
  user: process.env.MIKROTIK_USER,
  password: process.env.MIKROTIK_PASS,
});

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
    )
    .catch((err) => {
      reject(err);
    });
/**
 * @TODO, add @privateKey to createClientCertificate
 * Add an client OVPN
 * @client
 * @name - string and unique
 * @password - string
 * @privateKey - string
 */
const addOVPN = (client, name, password, privateKey) =>
  client.menu("/ppp/secret").add({
    name,
    password,
    service: "ovpn",
    profile: "OPEN_VPN",
  });

/**
 * @TODO, remove certificate of client
 * @client
 * @name - string and unique
 */
const removeOVPN = (client, name) =>
  client.menu("/ppp/secret").remove({
    name,
  });

const addCertificaClient = (client, name) =>
  client.menu("/certificate").add({
    name,
    ["key-usage"]: "tls-client",
    ["common-name"]: name,
  });

const signCertificateClient = (client, { id, name }) =>
  client.menu("/certificate").exec(`sign`, {
    id: id,
    name: name,
    ca: "CA",
  });

const revokeCertificateClient = (client, { id, name }) =>
  client
    .menu("/certificate")
    .remove({
      name,
    })
    .catch((err) => {
      if (
        err.message &&
        err.message.indexOf("issued certificate can only be revoked") > -1
      ) {
        return client.menu(
          "/certificate",
          exec("revoke", {
            id: "*10",
          })
        );
      }
      throw err;
    });

const testing = {
  id: "*10",
  name: "testing",
};

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
    //   "testing",
    //   "testing",
    //   "41251424"
    // ).catch((err) => console.log(`Error adding a new openVPN client`, err));
    // console.log(`Added:`, added);

    // // Delete of OVPN
    // await removeOVPN(client, "testing").catch((err) =>
    //   console.log("Error deleted: ", err)
    // );

    // Add a certificate
    // const addedCertificate = await addCertificaClient(
    //   client,
    //   testing.name
    // ).catch((err) => console.log("Error add certificate", err));
    // console.log(addedCertificate);

    // Sign a certificate
    // const signed = await signCertificateClient(client, testing);
    // console.log(signed);

    // Remove a certificate if isn't signed!
    // await revokeCertificateClient(client, testing);
  } catch (err) {
    console.log("Error API: ", err);
  } finally {
    api.close();
  }
};

start();
