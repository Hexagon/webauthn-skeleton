# webauthn-skeleton

## Modified vesion with persistent data on file.

This is a working skeleton of a Node.js/Express application with passwordless login (Web Authentication API, WebAuthN, FIDO2).

Live at [https://56k.guru/webauthn](https://56k.guru/webauthn)

Tested with Windows Hello, Yubikey or Android lockscreen, more to come.

Supports adding more than one authentication method to the same account.

Supports transfering account to another device by a time limited one time link or QR-code.

Using express and [fido2-lib](https://www.npmjs.com/package/fido2-lib)

Note: This is a _heavily_ modified and improved version of [github.com/fido-alliance/webauthn-demo](https://github.com/fido-alliance/webauthn-demo)

## Getting it running

First clone this repo, then:

### 1. Install dependencies

```npm install```

### 2. Generate self signed certificate and keys (webauthn requires HTTPS)

**I repeat, you need to generate keys, certificate and serve using https for webauthn to work**

```
cd keys

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -subj '/CN=localhost'
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

rm csr.pem

cd ..
```

### 3. Start server 

```node app```

### 4. Open browser

```https://localhost:3000```

## Docker development build

```docker build . --tag="hexagon/webauthn-skeleton"```

```
sudo docker run \
  -d \
  --restart=always \
  -e WAS_ORIGIN="https://localhost:3000" \
  -e WAS_RPID="localhost" \
  -e WAS_BASE_URL="https://localhost:3000/" \
  -e WAS_BASE_URL="https://localhost:3000/orlikethisifservedfromasuburl" \
  -e WAS_RPNAME="WebAuthN Demo" \
  -e WAS_MODE="development" \
  -e WAS_PORT=3000 \
  --name webauthndemo \
  hexagon/webauthn-skeleton```
