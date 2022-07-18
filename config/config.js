require("dotenv").config();
const env = process.env;

const development = {
  username: env.DEV_MYSQL_USERNAME,
  password: env.DEV_MYSQL_PASSWORD,
  database: env.DEV_MYSQL_DATABASE,
  host: env.DEV_MYSQL_HOST,
  dialect: "mysql",
  logging: false,
  //port: env.MYSQL_PORT
};

const production = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: "mysql",
  //port: env.MYSQL_PORT
};

const test = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE_TEST,
  host: env.MYSQL_HOST,
  dialect: "mysql",
  //port: env.MYSQL_PORT
};

const initSetting = {
  user: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: "mysql",
  host: env.MYSQL_HOST,
};

module.exports = { development, production, test, initSetting };
