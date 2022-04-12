const JsonDB = require('node-json-db').JsonDB
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config

const database = new JsonDB(new Config("myDataBase", true, false, '/'));

try {
    var data = database.getData("/users");
} catch(error) {
    console.log("Created a new db");
    database.push("/users",{});
};

module.exports = database;