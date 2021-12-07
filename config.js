let config = {
    "port": 3000,
    "origin": "https://localhost:3000",
    "rpId": "localhost",
    "rpName": "Webauthn Skeleton",
    "mode": "development"
};

config.port = process.env.PORT || config.port;
config.origin = process.env.WAS_ORIGIN || config.origin;
config.rpId = process.env.WAS_RPID || config.rpId;
config.rpName = process.env.WAS_RPNAME || config.rpName;
config.mode = process.env.WAS_MODE || config.mode;

module.exports = config;