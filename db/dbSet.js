const { prefix, token, db_host, db_user, db_password, db_database } = require('../config.json');
const mysql = require('mysql');

module.exports = mysql.createConnection({
    host    :   db_host,
    user    :   db_user,
    password    :   db_password,
    database    :   db_database
});