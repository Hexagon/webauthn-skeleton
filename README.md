# webauthn-skeleton

This is a working demo/skeleton of a Node.js/Express application with passworless login (WebAuthN/FIDO2).

Supports authentication with Windows Hello, Yubikey or Android lockscreen (i think), more to come.

Using express and fido2-lib 

Work in progress, but works!

Note: This is a _heavily_ modified and improved version of [github.com/fido-alliance/webauthn-demo](https://github.com/fido-alliance/webauthn-demo)

## Getting it running

### 1. Generate self signed certificate and keys (webauthn requires HTTPS)

```
cd keys

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -subj '/CN=localhost'
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

rm csr.pem

cd ..
```

## 2. Start server 

```node app```

## 3. Open browser

```https://localhost:3000```