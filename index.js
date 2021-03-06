const forge = require('node-forge');
const {pki, md} = forge;

const api = {
  generateKeys() {
    const keys = pki.rsa.generateKeyPair(2048);
    const publicKey = pki.publicKeyToPem(keys.publicKey);
    const privateKey = pki.privateKeyToPem(keys.privateKey);
    return {publicKey, privateKey};
  },
  generateCert(keys, opts) {
    const publicKey = pki.publicKeyFromPem(keys.publicKey);
    const privateKey = pki.privateKeyFromPem(keys.privateKey);
    const {
      commonName = 'zeovr.io',
      countryName = 'US',
      ST = 'California',
      localityName = 'San Francisco',
      organizationName = 'Zeo VR',
      OU = 'Dev',
      subjectAltNames = [],
    } = opts;

    const cert = pki.createCertificate();
    cert.publicKey = publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

    const attrs = [
      {
        name: 'commonName',
        value: commonName
      },
      {
        name: 'countryName',
        value: countryName
      },
      {
        shortName: 'ST',
        value: ST
      },
      {
        name: 'localityName',
        value: localityName
      },
      {
        name: 'organizationName',
        value: organizationName,
      },
      {
        shortName: 'OU',
        value: OU
      }
    ];
    const extensions = [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'nsCertType',
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
      },
      {
        name: 'subjectAltName',
        altNames: subjectAltNames.map(subjectAltName => ({
          type: 2, // DNS
          value: subjectAltName
        })).concat([
          {
            type: 7, // IP
            ip: '127.0.0.1'
          }
        ])
      },
      {
        name: 'subjectKeyIdentifier'
      }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions(extensions);
    cert.sign(privateKey, md.sha256.create());

    const pemCert = pki.certificateToPem(cert);
    return pemCert;
  }
};

module.exports = api;
