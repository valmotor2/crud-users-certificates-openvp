# mikrotik-certificate-users-openvpn-crud

It's used for Mikrotik, it's an easy CRUD with users (secrets ) and certificates generated or revoked user for remote connection with open VPN.

I wanted to have a option for people who are using openvpn client and the company using
mikrotik as me to connect at server of company.

I didn't want to particapate mysel to create certificate for each users, sign all certificate created by each client for the file **client**.ovpn

**steps**

1. install dependencies: npm install
2. node app.js
3. On mikrotik device it's necessary to configure OpenVPN and export certificate CA.crt in files of Mikrotik. It's mandatory for create the file **client**.ovpn and must specified in interface of this mini application the name of CA.crt if is another name , change the name, default is this.
