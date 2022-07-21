const mysql = require('mysql2');
const { initSetting } = require("../config/config");
const models = require("../models");

module.exports = {
    connectDatabase: async () => {
        const connection = await mysql.createConnection(initSetting);
        await connection.connect(function(err) {
            if (err) throw err;
            connection.query("CREATE DATABASE IF NOT EXISTS agora", function (err, result) { //데이터베이스가 존재하지 않는다면 생성시켜준다.
                if (err) throw err;
                connection.end();
            });
        });
        models.sequelize
            .sync()
            .then(() => {
                console.log(" DB 연결 성공");
            })
            .catch((err) => {
                console.log("연결 실패");
                console.log(err);
            });
    },
}


