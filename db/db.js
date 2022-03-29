const JsonDB = require('node-json-db').JsonDB
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config

const database = new JsonDB(new Config("myDataBase", true, false, '/'));

try {
    var data = database.getData("/users");
} catch(error) {
    // The error will tell you where the DataPath stopped. In this case test1
    // Since /test1/test does't exist.
    console.error("Created a new db");
    database.push("/users",{});
};

module.exports = database;