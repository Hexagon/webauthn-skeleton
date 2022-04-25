# webauthn-skeleton

This is a work in progress (but working) skeleton of a Deno/Opine application with passwordless login (Web Authentication API, WebAuthN, FIDO2).

Node version (Koa and @hexagon/webauthn) live at [https://56k.guru/webauthn](https://56k.guru/webauthn)
Deno version (Deno, Opine and @hexagon/webauthn) live at [https://56k.guru/webauthn-deno](https://56k.guru/webauthn-deno)

## Features

*  Tested with Windows Hello, Yubikey or Android lockscreen, more to come.
*  Supports adding more than one authentication method to the same account.
*  Supports transfering account to another device by a time limited one time link or QR-code.

Using Koa and [@hexagon/webauthn](https://github.com/hexagon/webauthn)

## Versions

There is multiple versions of this demo available in different branches

| Runtime | Server framework | Branch | Webauthn-lib |
| ------- | ---------------- | ------ | ------------ |
| Node | Koa | [main](https://github.com/Hexagon/webauthn-skeleton) | [webauthn](https://github.com/hexagon/webauthn) |
| Node | Express | [server/express](https://github.com/Hexagon/webauthn-skeleton/tree/server/express) | [fido2-lib](https://www.npmjs.com/package/fido2-lib) |
| Deno | Opine | [server/deno](https://github.com/Hexagon/webauthn-skeleton/tree/server/deno) | [webauthn](https://github.com/hexagon/webauthn) |

## Getting it running

First clone this repo, then:

### 0. Install Deno

### 1. Generate self signed certificate and keys (webauthn requires HTTPS), and import the cert on your computer

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

### 2. Start server 

```deno run --allow-read --allow-net --allow-env --allow-write ./app.ts```

or Run -> Run without debugging in VS Code

### 3. Open browser

```https://localhost:3000```

## Docker development build

```docker build . --tag="hexagon/webauthn-skeleton-deno"```

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
  --name webauthndemo-deno \
  hexagon/webauthn-skeleton-deno```
