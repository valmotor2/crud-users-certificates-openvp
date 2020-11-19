const express = require("express");
const app = express();
const port = 3003;

const RouterOSClient = require("routeros-client").RouterOSClient;

const api = new RouterOSClient({
  host: "192.168.0.1",
  user: "api",
  password: "bestcall.ro2020",
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

const revokeCertificateClient = (client, name) =>
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
        console.log("errr");
      }
      return err;
    });

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
    //   "anghel.monica.bestcall"
    // ).catch((err) => console.log("Error add certificate", err));
    // console.log(addedCertificate);

    // Sign a certificate
    // const signed = await signCertificateClient(client, {
    //   name: "anghel.monica.bestcall",
    //   id: "*10",
    // });
    // console.log(signed);

    // Remove a certificate if isn't signed!
    await revokeCertificateClient(client, "anghel.monica.bestcall");
  } catch (err) {
    console.log("start error", err);
  } finally {
    api.close();
  }
};

start();
