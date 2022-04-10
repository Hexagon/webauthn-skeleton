# webauthn-skeleton

This is a *WORK IN PROGRESS* skeleton of a Deno/Opine application with passwordless login (Web Authentication API, WebAuthN, FIDO2). 

There is also a Koa-version available at the [main](https://github.com/Hexagon/webauthn-skeleton/tree/main) branch.

Live at [https://56k.guru/webauthn](https://56k.guru/webauthn)

Tested with Windows Hello, Yubikey or Android lockscreen, more to come.

Supports adding more than one authentication method to the same account.

Supports transfering account to another device by a time limited one time link or QR-code.

Using Opine and (ToDo: which fido2-lib)

Note: This is a _heavily_ modified and improved version of [github.com/fido-alliance/webauthn-demo](https://github.com/fido-alliance/webauthn-demo)

## Getting it running

First clone this repo, then:

### 0. Install Deno

### 1. Generate self signed certificate and keys (webauthn requires HTTPS)

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
