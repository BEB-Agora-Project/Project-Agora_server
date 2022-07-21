const mysql = require('mysql2');
const { initSetting } = require("../config/config");

async function createDatabase() {
    const connection = mysql.createConnection(initSetting);
    connection.connect(function(err) {
        if (err) throw err;
        connection.query("CREATE DATABASE IF NOT EXISTS agora", function (err, result) { //데이터베이스가 존재하지 않는다면 생성시켜준다.
            if (err) throw err;
            connection.end();
        });
    });

}

module.exports = { createDatabase };


