# mikrotik-certificate-users-openvpn-crud

It's used for Mikrotik, it's an easy CRUD with users (secrets ) and certificates generated or revoked user for remote connection with open VPN.

I wanted to have a option for people who are using openvpn client and the company using
mikrotik as me to connect at server of company.

I didn't want to particapate mysel to create certificate for each users, sign all certificate created by each client for the file **client**.ovpn

**steps on backend**

PRE: create the folders downalods/ovpn, in these folder will download the required files for generate ovpn, after generated the files downloaded will be deleted, and in the folder ovpn will be file generated for the employee

1. cd backend
2. install dependencies: npm install
3. node app.js
4. On mikrotik device it's necessary to configure OpenVPN and export certificate CA.crt in files of Mikrotik. It's mandatory for create the file **client**.ovpn and must specified in interface of this mini application the name of CA.crt if is another name , change the name, default is this.

**steps on frontend**

1. cd frontend
2. npm install
3. npm run start

# Be aware!

**This is only module, no auth, oath, no firewall or anything sutff.**
