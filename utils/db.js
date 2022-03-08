const JsonDB = require('node-json-db').JsonDB
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config
const crypto = require("crypto")

const database = new JsonDB(new Config("myDataBase", true, false, '/'));

try {
    var data = database.getData("/users");
} catch(error) {
    // The error will tell you where the DataPath stopped. In this case test1
    // Since /test1/test does't exist.
    console.error("Created a new db");
    database.push("/users","{}");
    database.push("/keys", [crypto.randomBytes(32).toString("hex")]);
    console.log(database.getData("/keys"));
};

/*
let database = {
    users: {
        /* username: {
            'name': name,
            'registered': false,
            'id': id,
            'authenticators': [],
            'oneTimeToken': undefined,
            'recoveryEmail': undefined
        } */
/*    }
};
*/
module.exports = database;
