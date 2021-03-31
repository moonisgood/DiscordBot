const mysql = require('mysql');
const { db_host, db_user, db_password, db_database } = require('../config.js');

let pool = mysql.createPool(
  {
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database,
    connectionLimit: 10
  }
);

function getConnection(callback) {
  pool.getConnection(function (err, conn) {
    if(!err) {
      callback(conn);
    }
  });
}

module.exports = getConnection;